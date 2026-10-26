import { useMemo } from 'react';
import * as THREE from 'three';
import { usePresence } from '../shared/frame';
import { ABOUT } from '../../worlds/portfolio';

const RADIUS = 60000;
const CENTER: [number, number, number] = [ABOUT[0] + 6000, ABOUT[1] - 67500, ABOUT[2] - 38000];

const planetVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const planetFragment = /* glsl */ `
uniform vec3 uSun;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uRim;
uniform float uTime;
uniform float uPresence;
varying vec3 vNormal;
varying vec3 vWorld;
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float n = mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  return n;
}
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(cameraPosition - vWorld);
  float light = clamp(dot(n, normalize(uSun)) * 0.6 + 0.4, 0.0, 1.0);
  vec3 q = n * 6.0 + vec3(uTime * 0.004, 0.0, uTime * 0.002);
  float bands = noise(q) * 0.6 + noise(q * 2.7) * 0.3 + noise(q * 7.1) * 0.1;
  vec3 surface = mix(uDeep, uShallow, smoothstep(0.35, 0.8, bands)) * (0.25 + 0.75 * light);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 color = surface * (1.0 - rim * 0.5) + uRim * rim * 0.75;
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

/**
 * About: a calm atmospheric world. A vast teal planet curves away below the
 * introduction, its atmosphere glowing along the horizon, with slow aurora.
 */
export default function AboutWorld({ index }: { index: number }) {
  const { planet, halo, aurora } = useMemo(() => {
    const shared = { uPresence: { value: 1 }, uRim: { value: new THREE.Color('#5EEAD4') } };
    return {
      planet: new THREE.ShaderMaterial({
        vertexShader: planetVertex, fragmentShader: planetFragment,
        uniforms: { ...shared, uSun: { value: new THREE.Vector3(-0.4, 0.6, -0.7) }, uDeep: { value: new THREE.Color('#020A0D') }, uShallow: { value: new THREE.Color('#072A31') }, uTime: { value: 0 } },
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

  const ref = usePresence(index, (presence, frame) => {
    planet.uniforms.uTime.value = frame.time;
    planet.uniforms.uPresence.value = 0.35 + 0.65 * presence;
    halo.uniforms.uPresence.value = presence;
    aurora.uniforms.uTime.value = frame.time;
    aurora.uniforms.uPresence.value = presence;
  }, 1.0);

  return (
    <group ref={ref}>
      <mesh material={planet} position={CENTER}>
        <sphereGeometry args={[RADIUS, 128, 64]} />
      </mesh>
      <mesh material={halo} position={CENTER}>
        <sphereGeometry args={[RADIUS * 1.035, 96, 48]} />
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
