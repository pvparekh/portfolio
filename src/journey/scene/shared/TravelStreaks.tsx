import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef } from './frame';
import { particles } from '../../core/budget';

const COUNT = particles(420);
const BOX = 9000;

const vertex = /* glsl */ `
attribute vec2 corner;
attribute vec4 aSeed;
uniform vec3 uCam;
uniform vec3 uVel;
uniform float uSpeed;
uniform vec2 uResolution;
varying float vAlpha;
varying vec2 vUv;
void main() {
  // World-fixed points wrapped into a box around the camera: passing them reads as travel.
  vec3 p = aSeed.xyz * ${BOX.toFixed(1)};
  vec3 rel = mod(p - uCam + ${(BOX / 2).toFixed(1)}, ${BOX.toFixed(1)}) - ${(BOX / 2).toFixed(1)};
  vec3 head = uCam + rel;
  vec3 tail = head - uVel * 0.09;
  mat4 vp = projectionMatrix * viewMatrix;
  vec4 ch = vp * vec4(head, 1.0);
  vec4 ct = vp * vec4(tail, 1.0);
  float dist = length(rel);
  vAlpha = smoothstep(0.0, 1.0, uSpeed) * (1.0 - smoothstep(${(BOX * 0.25).toFixed(1)}, ${(BOX * 0.5).toFixed(1)}, dist)) * smoothstep(300.0, 900.0, dist);
  if (ch.w < 10.0 || ct.w < 10.0 || vAlpha < 0.002) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vAlpha = 0.0; return; }
  vec2 sh = ch.xy / ch.w * 0.5 * uResolution;
  vec2 st = ct.xy / ct.w * 0.5 * uResolution;
  vec2 d = sh - st;
  float l = length(d);
  vec2 n = l > 0.001 ? vec2(-d.y, d.x) / l : vec2(0.0, 1.0);
  vec4 c = mix(ct, ch, corner.x);
  c.xy += n * corner.y * 1.1 * 2.0 / uResolution * c.w;
  gl_Position = c;
  vUv = corner;
  vAlpha *= 0.55 + 0.45 * aSeed.w;
}`;

const fragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
varying vec2 vUv;
void main() {
  float along = smoothstep(0.0, 0.8, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x));
  float across = 1.0 - abs(vUv.y);
  float a = vAlpha * along * across;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}`;

/**
 * Light streaks that exist only in travel: invisible at rest, appearing in
 * proportion to camera speed. Cool white, sparse; this is the only "speed"
 * effect in the journey.
 */
export default function TravelStreaks() {
  const { geometry, material } = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('corner', new THREE.Float32BufferAttribute([0, -1, 0, 1, 1, -1, 1, 1], 2));
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    g.setIndex([0, 2, 1, 2, 3, 1]);
    const seeds = new Float32Array(COUNT * 4);
    let s = 7;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < COUNT; i++) seeds.set([rand(), rand(), rand(), rand()], i * 4);
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
    g.instanceCount = COUNT;
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uCam: { value: new THREE.Vector3() },
        uVel: { value: new THREE.Vector3() },
        uSpeed: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uColor: { value: new THREE.Color('#DCE6F5') },
      },
    });
    return { geometry: g, material: m };
  }, []);

  const last = useMemo(() => ({ pos: new THREE.Vector3(), vel: new THREE.Vector3(), t: 0 }), []);
  useFrame(state => {
    const frame = frameRef.current;
    if (!frame) return;
    const now = performance.now() / 1000;
    const dt = Math.max(1 / 240, Math.min(now - last.t, 0.1));
    last.t = now;
    const cam = new THREE.Vector3(...frame.pose.position);
    const vel = cam.clone().sub(last.pos).divideScalar(dt);
    last.pos.copy(cam);
    if (vel.length() > 400000) vel.set(0, 0, 0);
    last.vel.lerp(vel, 0.25);
    const u = material.uniforms;
    u.uCam.value.copy(cam);
    u.uVel.value.copy(last.vel);
    u.uSpeed.value = Math.min(1, Math.max(0, (last.vel.length() - 4000) / 40000)) * Math.min(1, frame.travel * 1.6);
    u.uResolution.value.set(state.size.width * state.viewport.dpr, state.size.height * state.viewport.dpr);
  });
  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}
