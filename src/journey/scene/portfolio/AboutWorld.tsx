import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePresence } from '../shared/frame';
import { ABOUT } from '../../worlds/portfolio';

const RADIUS = 60000;
const CENTER: [number, number, number] = [ABOUT[0] + 6000, ABOUT[1] - 67500, ABOUT[2] - 38000];
/** Centre of the moon's slow drift: high in the sky beyond the planet's horizon. */
const MOON_PATH: [number, number, number] = [ABOUT[0] + 23000, ABOUT[1] + 10500, ABOUT[2] - 64000];
/** The moon is lit from in front of the viewer, so it reads as a bright gibbous moon. */
const MOON_SUN = new THREE.Vector3(0.45, 0.35, 0.85);
const SUN = new THREE.Vector3(0.75, 0.42, -0.5);

const planetVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const noiseGlsl = /* glsl */ `
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float n = mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  return n;
}`;

const planetFragment = /* glsl */ `
uniform vec3 uSun;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uRim;
uniform vec3 uCity;
uniform float uTime;
uniform float uPresence;
varying vec3 vNormal;
varying vec3 vWorld;
${noiseGlsl}
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 sun = normalize(uSun);
  float ndl = dot(n, sun);
  float light = clamp(ndl * 0.6 + 0.4, 0.0, 1.0);
  float day = smoothstep(-0.12, 0.3, ndl);
  vec3 q = n * 6.0 + vec3(uTime * 0.004, 0.0, uTime * 0.002);
  float bands = noise(q) * 0.6 + noise(q * 2.7) * 0.3 + noise(q * 7.1) * 0.1;
  float land = smoothstep(0.35, 0.8, bands);
  vec3 surface = mix(uDeep, uShallow, land) * (0.25 + 0.75 * light);
  // Weather: a cloud layer drifting faster than the surface beneath it.
  vec3 cq = n * 16.0 + vec3(uTime * 0.011, uTime * 0.002, uTime * 0.006);
  float clouds = smoothstep(0.56, 0.86, noise(cq) * 0.65 + noise(cq * 2.4) * 0.35);
  surface = mix(surface, vec3(0.32, 0.5, 0.55) * (0.12 + 0.88 * day), clouds * 0.32);
  // Night side: city lights, like nodes on a network, gently breathing.
  vec3 g = n * 260.0;
  vec3 cell = floor(g);
  float node = step(0.982, hash(cell)) * (1.0 - smoothstep(0.08, 0.32, length(fract(g) - 0.5)));
  float city = node * smoothstep(0.45, 0.7, bands) * (1.0 - day) * (1.0 - clouds);
  // Sun glint on open water.
  float glint = pow(max(dot(n, normalize(sun + v)), 0.0), 140.0) * (1.0 - land) * (1.0 - clouds) * day;
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 color = surface * (1.0 - rim * 0.5) + uRim * rim * 0.75;
  color += uCity * city * (0.65 + 0.35 * sin(uTime * 1.7 + hash(cell + 1.0) * 30.0));
  color += vec3(0.55, 0.85, 0.9) * glint * 0.6;
  gl_FragColor = vec4(color * uPresence, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const haloFragment = /* glsl */ `
uniform vec3 uRim;
uniform float uPresence;
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec3 v = normalize(cameraPosition - vWorld);
  float edge = 1.0 - abs(dot(normalize(vNormal), v));
  // Soft atmosphere: rises toward the limb, then fades before the halo's own silhouette.
  float a = smoothstep(0.55, 0.92, edge) * (1.0 - smoothstep(0.93, 1.0, edge)) * 0.5 * uPresence;
  gl_FragColor = vec4(uRim * a, a);
  #include <colorspace_fragment>
}`;

const auroraFragment = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform float uTime;
uniform float uPresence;
varying vec2 vUv;
void main() {
  float wave = sin(vUv.x * 9.0 + uTime * 0.12) * 0.08 + sin(vUv.x * 23.0 - uTime * 0.07) * 0.03;
  float band = smoothstep(0.0, 0.35, vUv.y + wave) * (1.0 - smoothstep(0.35, 1.0, vUv.y + wave));
  float edges = smoothstep(0.0, 0.15, vUv.x) * (1.0 - smoothstep(0.85, 1.0, vUv.x));
  vec3 color = mix(uA, uB, vUv.x);
  float a = band * edges * 0.16 * uPresence;
  gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`;

const auroraVertex = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

const RING_INNER = RADIUS * 1.32;
const RING_WIDTH = RADIUS * 0.3;
const ringFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uPresence;
varying vec3 vLocal;
float h1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); return mix(h1(i), h1(i + 1.0), f * f * (3.0 - 2.0 * f)); }
void main() {
  float r = (length(vLocal.xy) - ${RING_INNER.toFixed(1)}) / ${RING_WIDTH.toFixed(1)};
  // Banded like a real ring system: many thin ringlets and a couple of clear gaps.
  float bands = n1(r * 90.0) * 0.6 + n1(r * 23.0 + 4.0) * 0.4;
  float gaps = smoothstep(0.02, 0.05, abs(r - 0.62)) * smoothstep(0.01, 0.03, abs(r - 0.27));
  float edge = smoothstep(0.0, 0.08, r) * (1.0 - smoothstep(0.85, 1.0, r));
  float shimmer = 0.85 + 0.15 * sin(atan(vLocal.y, vLocal.x) * 40.0 + uTime * 0.05);
  float a = bands * gaps * edge * shimmer * 0.24 * uPresence;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}`;
const ringVertex = 'varying vec3 vLocal; void main(){ vLocal = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

const moonFragment = /* glsl */ `
uniform vec3 uSun;
uniform float uPresence;
varying vec3 vNormal;
varying vec3 vWorld;
${noiseGlsl}
void main() {
  vec3 n = normalize(vNormal);
  float light = smoothstep(-0.05, 0.4, dot(n, normalize(uSun)));
  float maria = noise(n * 3.0) * 0.6 + noise(n * 9.0) * 0.4;
  vec3 color = mix(vec3(0.42, 0.46, 0.5), vec3(0.24, 0.27, 0.31), smoothstep(0.45, 0.7, maria)) * light;
  vec3 v = normalize(cameraPosition - vWorld);
  color += vec3(0.25, 0.45, 0.5) * pow(1.0 - max(dot(n, v), 0.0), 4.0) * 0.25;
  gl_FragColor = vec4(color * uPresence, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Satellites in low orbit: positions come from time on the GPU (no per-frame CPU work). */
const satelliteVertex = /* glsl */ `
attribute float aPhase;
uniform float uTime;
uniform float uRadius;
varying float vPhase;
void main() {
  float a = aPhase * 6.2831853 + uTime * 0.018;
  vPhase = aPhase;
  vec4 mv = modelViewMatrix * vec4(cos(a) * uRadius, 0.0, sin(a) * uRadius, 1.0);
  gl_PointSize = clamp(5200.0 / -mv.z, 1.5, 4.0);
  gl_Position = projectionMatrix * mv;
}`;
const satelliteFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uPresence;
varying float vPhase;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float blink = 0.6 + 0.4 * step(0.5, fract(uTime * 0.5 + vPhase * 7.0));
  float a = (1.0 - smoothstep(0.2, 0.5, d)) * blink * uPresence;
  gl_FragColor = vec4(uColor * a, a);
}`;

/**
 * About: a calm, living world. A vast teal planet curves away below the
 * introduction: weather drifts over it, its night side glitters with city
 * lights and water catches the sun. A ring system arcs over the horizon,
 * satellites cross a low orbit, a moon drifts and aurora hangs in the sky.
 */
export default function AboutWorld({ index }: { index: number }) {
  const { planet, halo, aurora } = useMemo(() => {
    const shared = { uPresence: { value: 1 }, uRim: { value: new THREE.Color('#5EEAD4') } };
    return {
      planet: new THREE.ShaderMaterial({
        vertexShader: planetVertex, fragmentShader: planetFragment,
        uniforms: { ...shared, uSun: { value: SUN }, uCity: { value: new THREE.Color('#FCD34D') }, uDeep: { value: new THREE.Color('#020A0D') }, uShallow: { value: new THREE.Color('#072A31') }, uTime: { value: 0 } },
      }),
      halo: new THREE.ShaderMaterial({
        vertexShader: planetVertex, fragmentShader: haloFragment, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: shared,
      }),
      aurora: new THREE.ShaderMaterial({
        vertexShader: auroraVertex, fragmentShader: auroraFragment, side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uA: { value: new THREE.Color('#2DD4BF') }, uB: { value: new THREE.Color('#818CF8') }, uTime: { value: 0 }, uPresence: { value: 1 } },
      }),
    };
  }, []);

  const { ring, moon, satellites, orbitLine, satelliteGeometry } = useMemo(() => {
    const count = 12;
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) phases[i] = i / count + (i % 2) * 0.031;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    const circle = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 257 }, (_, i) => {
      const a = (i / 256) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * RADIUS * 1.1, 0, Math.sin(a) * RADIUS * 1.1);
    }));
    return {
      ring: new THREE.ShaderMaterial({
        vertexShader: ringVertex, fragmentShader: ringFragment, side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color('#9BE7DC') }, uTime: { value: 0 }, uPresence: { value: 1 } },
      }),
      moon: new THREE.ShaderMaterial({
        vertexShader: planetVertex, fragmentShader: moonFragment,
        uniforms: { uSun: { value: MOON_SUN }, uPresence: { value: 1 } },
      }),
      satellites: new THREE.ShaderMaterial({
        vertexShader: satelliteVertex, fragmentShader: satelliteFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color('#E0FFFA') }, uTime: { value: 0 }, uRadius: { value: RADIUS * 1.1 }, uPresence: { value: 1 } },
      }),
      orbitLine: new THREE.Line(circle, new THREE.LineBasicMaterial({ color: '#5EEAD4', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })),
      satelliteGeometry: geometry,
    };
  }, []);
  const moonRef = useRef<THREE.Mesh>(null);

  const ref = usePresence(index, (presence, frame) => {
    planet.uniforms.uTime.value = frame.time;
    planet.uniforms.uPresence.value = 0.35 + 0.65 * presence;
    halo.uniforms.uPresence.value = presence;
    aurora.uniforms.uTime.value = frame.time;
    aurora.uniforms.uPresence.value = presence;
    ring.uniforms.uTime.value = frame.time;
    ring.uniforms.uPresence.value = presence;
    satellites.uniforms.uTime.value = frame.time;
    satellites.uniforms.uPresence.value = presence;
    // The moon only belongs to this world's sky: it fades in on arrival, not from afar.
    moon.uniforms.uPresence.value = presence * presence;
    (orbitLine.material as THREE.LineBasicMaterial).opacity = 0.12 * presence;
    // The moon drifts slowly across the sky beyond the horizon.
    if (moonRef.current) {
      // Opaque, so hide it outright rather than drawing a dark disc while it is faded out.
      moonRef.current.visible = presence > 0.02;
      const a = 0.9 + frame.time * 0.0035;
      moonRef.current.position.set(MOON_PATH[0] + Math.cos(a) * 7000, MOON_PATH[1] + Math.sin(a * 0.7) * 1500, MOON_PATH[2] + Math.sin(a) * 4000);
    }
  }, 1.0);

  return (
    <group ref={ref}>
      <mesh material={planet} position={CENTER}>
        <sphereGeometry args={[RADIUS, 128, 64]} />
      </mesh>
      <mesh material={halo} position={CENTER}>
        <sphereGeometry args={[RADIUS * 1.035, 96, 48]} />
      </mesh>
      {/* A ring system arcing up from behind the horizon. */}
      <mesh material={ring} position={CENTER} rotation={[-0.82, 0.18, 0.12]}>
        <ringGeometry args={[RING_INNER, RING_INNER + RING_WIDTH, 256, 1]} />
      </mesh>
      {/* Low orbit: a faint track with satellites crossing it. */}
      <group position={CENTER} rotation={[-1.424, 0, 0]}>
        <primitive object={orbitLine} />
        <points geometry={satelliteGeometry} material={satellites} frustumCulled={false} />
      </group>
      <mesh ref={moonRef} material={moon} position={MOON_PATH}>
        <sphereGeometry args={[2100, 48, 24]} />
      </mesh>
      <mesh material={aurora} position={[ABOUT[0] - 6000, ABOUT[1] + 2600, ABOUT[2] - 26000]} rotation={[0, 0.25, 0]}>
        <planeGeometry args={[52000, 9000, 1, 1]} />
      </mesh>
      <mesh material={aurora} position={[ABOUT[0] + 12000, ABOUT[1] + 5200, ABOUT[2] - 36000]} rotation={[0, -0.35, 0]}>
        <planeGeometry args={[44000, 7000, 1, 1]} />
      </mesh>
    </group>
  );
}
