import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePresence } from '../shared/frame';
import { CONTACT } from '../../worlds/portfolio';

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

const vertex = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/**
 * Contact: a quiet threshold. A single slow ring of warm and cool light frames
 * the invitation; the journey's warm highlight returns here at the end.
 */
export default function ContactWorld({ index }: { index: number }) {
  const ring = useRef<THREE.Mesh>(null);
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
    if (ring.current) ring.current.rotation.z = frame.time * 0.02;
  }, 1.0);

  return (
    <group ref={ref} position={CONTACT}>
      <mesh ref={ring} material={ringMaterial} position={[0, 0, -3600]}>
        <torusGeometry args={[4300, 12, 8, 256]} />
      </mesh>
      <mesh material={discMaterial} position={[0, 0, -3400]}>
        <planeGeometry args={[9000, 9000]} />
      </mesh>
      <mesh material={ringMaterial} position={[0, 0, -9000]} rotation={[0, 0, 0.6]}>
        <torusGeometry args={[7600, 5, 6, 256]} />
      </mesh>
    </group>
  );
}
