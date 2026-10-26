import { useMemo } from 'react';
import * as THREE from 'three';
import { usePresence } from '../shared/frame';
import { ORIGIN } from '../../worlds/portfolio';

const COUNT = 240;

const vertex = /* glsl */ `
attribute vec2 corner;
attribute vec4 aA; // x, y, z, length
attribute vec4 aB; // speed, phase, width, warm
uniform float uTime;
uniform float uPresence;
uniform vec2 uResolution;
varying vec2 vUv;
varying float vAlpha;
varying float vWarm;
void main() {
  // Dimensional light structures: hairlines drifting left to right at many depths.
  float span = 26000.0 + abs(aA.z) * 0.9;
  float x = mod(aA.x * span + uTime * aB.x, span) - span * 0.5;
  vec3 head = vec3(x, aA.y, aA.z);
  vec3 tail = head - vec3(aA.w, 0.0, 0.0);
  mat4 vp = projectionMatrix * modelViewMatrix;
  vec4 ch = vp * vec4(head, 1.0);
  vec4 ct = vp * vec4(tail, 1.0);
  float edge = smoothstep(0.0, 0.12, (x + span * 0.5) / span) * (1.0 - smoothstep(0.85, 1.0, (x + span * 0.5) / span));
  vAlpha = uPresence * edge * (0.25 + 0.75 * aB.y);
  if (ch.w < 20.0 || ct.w < 20.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vAlpha = 0.0; return; }
  vec2 sh = ch.xy / ch.w * 0.5 * uResolution;
  vec2 st = ct.xy / ct.w * 0.5 * uResolution;
  vec2 d = sh - st; float l = length(d);
  vec2 n = l > 0.001 ? vec2(-d.y, d.x) / l : vec2(0.0, 1.0);
  vec4 c = mix(ct, ch, corner.x);
  float px = max(aB.z * uResolution.y / c.w, 0.8);
  c.xy += n * corner.y * (px + 1.0) * 2.0 / uResolution * c.w;
  gl_Position = c;
  vUv = vec2(corner.x, corner.y * (px + 1.0) / px);
  vWarm = aB.w;
}`;

const fragment = /* glsl */ `
uniform vec3 uCool;
uniform vec3 uWarm;
varying vec2 vUv;
varying float vAlpha;
varying float vWarm;
void main() {
  float across = exp(-vUv.y * vUv.y * 3.0);
  float along = smoothstep(0.0, 0.7, vUv.x) * (1.0 - smoothstep(0.93, 1.0, vUv.x));
  vec3 color = mix(uCool, uWarm, vWarm);
  float a = vAlpha * across * along;
  gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`;

/**
 * Origin: vast, dark, minimal. The original six speed lines become a sparse
 * field of hairlines at genuinely different depths, a few warm, most cool;
 * one immense faint arc gives the place its scale.
 */
export default function OriginWorld({ index }: { index: number }) {
  const { geometry, material } = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('corner', new THREE.Float32BufferAttribute([0, -1, 0, 1, 1, -1, 1, 1], 2));
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    g.setIndex([0, 2, 1, 2, 3, 1]);
    const a = new Float32Array(COUNT * 4);
    const b = new Float32Array(COUNT * 4);
    let s = 11;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < COUNT; i++) {
      const z = -1800 - Math.pow(r(), 1.6) * 90000;
      const spread = 1400 + Math.abs(z) * 0.55;
      a.set([r(), (r() * 2 - 1) * spread * 0.55, z, 500 + r() * (2200 + Math.abs(z) * 0.05)], i * 4);
      b.set([90 + r() * 260 + Math.abs(z) * 0.004, r(), 1.2 + r() * 2.4, r() < 0.14 ? 1 : 0], i * 4);
    }
    g.setAttribute('aA', new THREE.InstancedBufferAttribute(a, 4));
    g.setAttribute('aB', new THREE.InstancedBufferAttribute(b, 4));
    g.instanceCount = COUNT;
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPresence: { value: 1 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uCool: { value: new THREE.Color('#BFD3F2') },
        uWarm: { value: new THREE.Color('#F5A524') },
      },
    });
    return { geometry: g, material: m };
  }, []);

  const arc = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#5B7BB0'), transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }), []);

  const ref = usePresence(index, (presence, frame) => {
    material.uniforms.uTime.value = frame.time;
    material.uniforms.uPresence.value = presence;
    material.uniforms.uResolution.value.set(frame.vp.width * Math.min(devicePixelRatio, 2), frame.vp.height * Math.min(devicePixelRatio, 2));
    arc.opacity = 0.14 * presence;
  }, 1.1);

  return (
    <group ref={ref} position={ORIGIN}>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      {/* One immense, faint arc far beyond the name: the scale of the place. */}
      <mesh material={arc} position={[24000, -42000, -210000]} rotation={[1.32, 0.18, 0.4]}>
        <torusGeometry args={[150000, 140, 6, 256]} />
      </mesh>
      <mesh material={arc} position={[-60000, 30000, -260000]} rotation={[1.1, -0.5, 0.2]}>
        <torusGeometry args={[90000, 90, 6, 200]} />
      </mesh>
    </group>
  );
}
