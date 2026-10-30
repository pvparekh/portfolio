import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Palette } from '../../core/types';
import { frameRef } from './frame';

const vertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const fragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
uniform float uTime;
varying vec3 vDir;
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  float h = vDir.y;
  vec3 color = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
  color = mix(color, uBottom, smoothstep(0.0, -0.35, h));
  // Sparse, very faint distant stars (deterministic per direction), slowly wheeling
  // so the sky is never still even when the visitor is.
  float spin = uTime * 0.0045;
  vec3 d = vec3(vDir.x * cos(spin) - vDir.z * sin(spin), vDir.y, vDir.x * sin(spin) + vDir.z * cos(spin));
  vec3 g = d * 900.0;
  vec3 cell = floor(g);
  vec3 local = fract(g) - 0.5;
  float star = step(0.9982, hash(cell)) * (1.0 - smoothstep(0.05, 0.22, length(local)));
  float twinkle = 0.6 + 0.4 * sin(uTime * 0.7 + hash(cell + 3.1) * 40.0);
  color += vec3(0.62, 0.7, 0.85) * star * twinkle * 0.35 * smoothstep(-0.1, 0.2, h);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Atmosphere colours shift with the destination: the void itself changes between worlds. */
export default function SkyDome({ palettes }: { palettes: Palette[] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const stops = useMemo(() => palettes.map(p => ({
    top: new THREE.Color(p.background),
    horizon: new THREE.Color(p.atmosphere),
    bottom: new THREE.Color(p.background).multiplyScalar(0.6),
  })), [palettes]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uTime: { value: 0 },
    },
  }), []);
  useFrame(() => {
    const frame = frameRef.current;
    if (!frame || !mesh.current) return;
    mesh.current.position.set(...frame.pose.position);
    const i = Math.max(0, Math.min(Math.floor(frame.place), stops.length - 1));
    const j = Math.min(i + 1, stops.length - 1);
    const f = Math.min(Math.max(frame.place - i, 0), 1);
    const u = material.uniforms;
    u.uTop.value.copy(stops[i].top).lerp(stops[j].top, f);
    u.uHorizon.value.copy(stops[i].horizon).lerp(stops[j].horizon, f).multiplyScalar(0.55);
    u.uBottom.value.copy(stops[i].bottom).lerp(stops[j].bottom, f);
    u.uTime.value = frame.time;
  });
  return (
    <mesh ref={mesh} material={material} renderOrder={-100} frustumCulled={false}>
      <sphereGeometry args={[400000, 48, 24]} />
    </mesh>
  );
}
