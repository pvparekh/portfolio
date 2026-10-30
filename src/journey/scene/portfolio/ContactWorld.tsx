import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePresence } from '../shared/frame';
import { CONTACT } from '../../worlds/portfolio';
import { particles } from '../../core/budget';

const ringFragment = /* glsl */ `
uniform float uTime;
uniform float uPresence;
uniform vec3 uWarm;
uniform vec3 uCool;
varying vec2 vUv;
void main() {
  float sweep = 0.5 + 0.5 * sin(vUv.x * 6.2831 - uTime * 0.25);
  vec3 color = mix(uCool, uWarm, sweep);
  float a = (0.35 + 0.65 * sweep) * uPresence;
  gl_FragColor = vec4(color * a * 1.4, a);
  #include <colorspace_fragment>
}`;

const discFragment = /* glsl */ `
uniform float uPresence;
uniform vec3 uWarm;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.0, 1.0, d)) * 0.16 * uPresence;
  gl_FragColor = vec4(uWarm * a, a);
  #include <colorspace_fragment>
}`;

/** Warm particles spiralling into the portal: each follows its own inward spiral, fading in and out. */
const inflowVertex = /* glsl */ `
uniform float uTime; uniform float uPresence; uniform float uScale;
attribute vec3 aSeed; varying float vAlpha;
void main() {
  float k = fract(uTime * 0.045 * (0.6 + aSeed.z) + aSeed.x);
  float r = mix(4800.0, 520.0, k);
  float a = aSeed.y * 6.2831 + k * 4.2;
  vec3 p = vec3(cos(a) * r, sin(a) * r * 0.82, -3600.0 - (1.0 - k) * 1800.0);
  vAlpha = smoothstep(0.0, 0.18, k) * (1.0 - smoothstep(0.82, 1.0, k)) * uPresence;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.4 + aSeed.z * 2.2) * uScale * 1800.0 / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const inflowFragment = /* glsl */ `
uniform vec3 uWarm; varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha * 0.8;
  gl_FragColor = vec4(uWarm * a, a);
}`;

const vertex = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/**
 * Contact: a quiet threshold. A single slow ring of warm and cool light frames
 * the invitation; the journey's warm highlight returns here at the end.
 */
export default function ContactWorld({ index }: { index: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const inflow = useMemo(() => {
    let s = 11;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const count = particles(700);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) seeds[i] = r();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    const m = new THREE.ShaderMaterial({
      vertexShader: inflowVertex, fragmentShader: inflowFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPresence: { value: 1 }, uScale: { value: 1 }, uWarm: { value: new THREE.Color('#F5A524') } },
    });
    return { geometry: g, material: m };
  }, []);
  const tilted = useRef<THREE.Mesh>(null);
  const { ringMaterial, discMaterial } = useMemo(() => ({
    ringMaterial: new THREE.ShaderMaterial({
      vertexShader: vertex, fragmentShader: ringFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPresence: { value: 1 }, uWarm: { value: new THREE.Color('#F5A524') }, uCool: { value: new THREE.Color('#7DD3FC') } },
    }),
    discMaterial: new THREE.ShaderMaterial({
      vertexShader: vertex, fragmentShader: discFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uPresence: { value: 1 }, uWarm: { value: new THREE.Color('#F59E0B') } },
    }),
  }), []);

  const ref = usePresence(index, (presence, frame) => {
    ringMaterial.uniforms.uTime.value = frame.time;
    ringMaterial.uniforms.uPresence.value = presence;
    discMaterial.uniforms.uPresence.value = presence;
    inflow.material.uniforms.uTime.value = frame.time;
    inflow.material.uniforms.uPresence.value = presence;
    inflow.material.uniforms.uScale.value = Math.min(window.devicePixelRatio, 2);
    if (ring.current) ring.current.rotation.z = frame.time * 0.02;
    if (tilted.current) tilted.current.rotation.z = 0.6 - frame.time * 0.015;
  }, 1.0);

  return (
    <group ref={ref} position={CONTACT}>
      {/* Sized to frame the invitation: the ring passes just outside the panel at 1:1. */}
      <mesh ref={ring} material={ringMaterial} position={[0, 0, -3600]}>
        <torusGeometry args={[1520, 7, 8, 256]} />
      </mesh>
      <mesh material={discMaterial} position={[0, 0, -3800]}>
        <planeGeometry args={[6400, 6400]} />
      </mesh>
      <group rotation={[1.15, 0, 0]} position={[0, 0, -7000]}>
        <mesh ref={tilted} material={ringMaterial}>
          <torusGeometry args={[3000, 5, 6, 256]} />
        </mesh>
      </group>
      <points geometry={inflow.geometry} material={inflow.material} frustumCulled={false} />
    </group>
  );
}
