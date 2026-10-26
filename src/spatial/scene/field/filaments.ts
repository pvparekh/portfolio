import * as THREE from 'three';
import vertexShader from './filament.vert.glsl?raw';
import fragmentShader from './filament.frag.glsl?raw';

export const palette = {
  amber: new THREE.Color('#F59E0B'),
  core: new THREE.Color('#FFE2A8'),
  ember: new THREE.Color('#B45309'),
  green: new THREE.Color('#22C55E'),
  haze: new THREE.Color('#3A2408'),
  grid: new THREE.Color('#F59E0B'),
};

/** Deterministic PRNG so every visitor (and every test run) sees the same field. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createFilamentGeometry(count: number, seed = 1) {
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute('corner', new THREE.Float32BufferAttribute([0, -1, 0, 1, 1, -1, 1, 1], 2));
  // three requires a position attribute for bounds; the shader ignores it.
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  geometry.setIndex([0, 2, 1, 2, 3, 1]);
  const random = mulberry32(seed);
  const seeds = new Float32Array(count * 4);
  const props = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seeds.set([random(), random(), Math.pow(random(), 0.75), random()], i * 4);
    // Crossing period follows the original 3.3–6.2 s speed lines.
    props.set([3.3 + random() * 2.9, 0.06 + random() * 0.14, 0.012 + random() * 0.03, random()], i * 4);
  }
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  geometry.setAttribute('aProps', new THREE.InstancedBufferAttribute(props, 4));
  geometry.instanceCount = count;
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  return geometry;
}

export function createFilamentMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendEquation: THREE.AddEquation,
    uniforms: {
      uFlow: { value: 0 },
      uFormFlow: { value: 0 },
      uTime: { value: 0 },
      uDepth: { value: 420 },
      uTanHalfFov: { value: Math.tan(THREE.MathUtils.degToRad(15)) },
      uAspect: { value: 1.6 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPixelRatio: { value: 1 },
      uVelocity: { value: 0 },
      uDensity: { value: 1 },
      uForm: { value: 0 },
      uFormKind: { value: 0 },
      uFormCenter: { value: new THREE.Vector3() },
      uFormA: { value: new THREE.Vector4() },
      uFormB: { value: new THREE.Vector4() },
      uFormC: { value: new THREE.Vector4() },
      uFormShare: { value: 0.55 },
      uHighlight: { value: new THREE.Vector2(-1, 0) },
      uFormAlpha: { value: 0.6 },
      uIntensity: { value: 0.6 },
      uAmber: { value: palette.amber.clone() },
      uCoreColor: { value: palette.core.clone() },
      uEmber: { value: palette.ember.clone() },
      uTint: { value: palette.amber.clone() },
      uGreen: { value: palette.green.clone() },
      uTintMix: { value: 0 },
      uCoreBoost: { value: 1 },
      uScrim: { value: 0 },
      uScrimRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    },
  });
}

const floorVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const floorFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
uniform float uCell;
uniform float uScrim;
uniform vec4 uScrimRect;
varying vec3 vWorld;
void main() {
  vec2 g = vWorld.xz / uCell;
  vec2 w = fwidth(g);
  vec2 lines = abs(fract(g - 0.5) - 0.5) / max(w, vec2(1e-4));
  float line = 1.0 - min(min(lines.x, lines.y), 1.0);
  // Thin out where cells shrink below a few pixels so the horizon stays calm.
  line *= 1.0 - smoothstep(0.08, 0.5, max(w.x, w.y));
  float d = length(vWorld.xz - cameraPosition.xz);
  float a = line * uAlpha * exp(-d * 0.03) * smoothstep(1.5, 9.0, d);
  vec2 s = max(abs(gl_FragCoord.xy - uScrimRect.xy) - uScrimRect.zw, 0.0);
  a *= 1.0 - uScrim * (1.0 - smoothstep(0.0, uScrimRect.z * 0.45, length(s)));
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}`;

export function createFloorMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: floorVertex,
    fragmentShader: floorFragment,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uColor: { value: palette.grid.clone() },
      uAlpha: { value: 0.085 },
      uCell: { value: 1.2 },
      uScrim: { value: 0 },
      uScrimRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    },
  });
}

const hazeVertex = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const hazeFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec2 uCenter;
uniform float uAspect;
uniform float uStrength;
varying vec2 vNdc;
void main() {
  vec2 d = vNdc - uCenter;
  d.x *= uAspect * 0.55;
  float glow = exp(-dot(d, d) * 2.2);
  float band = exp(-pow((vNdc.y - uCenter.y) / 0.07, 2.0)) * 0.35;
  float a = (glow * 0.85 + band) * uStrength;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}`;

export function createHazeMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: hazeVertex,
    fragmentShader: hazeFragment,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uColor: { value: palette.haze.clone() },
      uCenter: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1.6 },
      uStrength: { value: 1 },
    },
  });
}
