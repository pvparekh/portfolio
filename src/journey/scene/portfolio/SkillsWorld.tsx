import { useMemo } from 'react';
import * as THREE from 'three';
import { usePresence } from '../shared/frame';
import { SKILLS } from '../../worlds/portfolio';

const GROUPS = 6;

const nebulaFragment = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform float uTime;
uniform float uPresence;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main() {
  vec2 p = vUv * 3.0 + vec2(uTime * 0.004, 0.0);
  float n = fbm(p + fbm(p * 1.7));
  float falloff = 1.0 - smoothstep(0.15, 0.5, length(vUv - 0.5));
  vec3 color = mix(uA, uB, n);
  float a = smoothstep(0.3, 0.8, n) * falloff * 0.42 * uPresence;
  gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`;

/**
 * Skills: a constellation. Six star clusters (one per skill group) are joined
 * by faint lines around the panel, against a slow, muted nebula.
 */
export default function SkillsWorld({ index }: { index: number }) {
  const { points, lines, starMaterial, lineMaterial, nebula } = useMemo(() => {
    let s = 29;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const stars: number[] = [];
    const segments: number[] = [];
    const centres: THREE.Vector3[] = [];
    for (let g = 0; g < GROUPS; g++) {
      const angle = (g / GROUPS) * Math.PI * 2 + 0.4;
      const centre = new THREE.Vector3(SKILLS[0] + Math.cos(angle) * 9800, SKILLS[1] + Math.sin(angle) * 4600, SKILLS[2] - 3600 - (g % 2) * 1600);
      centres.push(centre);
      const count = 6 + Math.round(r() * 5);
      const cluster: THREE.Vector3[] = [];
      for (let i = 0; i < count; i++) {
        const p = centre.clone().add(new THREE.Vector3((r() - 0.5) * 1800, (r() - 0.5) * 1200, (r() - 0.5) * 1400));
        cluster.push(p);
        stars.push(p.x, p.y, p.z);
      }
      for (let i = 1; i < cluster.length; i++) segments.push(...cluster[i - 1].toArray(), ...cluster[i].toArray());
    }
    for (let g = 0; g < GROUPS; g++) segments.push(...centres[g].toArray(), ...centres[(g + 1) % GROUPS].toArray());
    // Background dust.
    for (let i = 0; i < 900; i++) stars.push(SKILLS[0] + (r() - 0.5) * 60000, SKILLS[1] + (r() - 0.5) * 30000, SKILLS[2] - 9000 - r() * 40000);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const gc = glow.getContext('2d')!;
    const grad = gc.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.18, 'rgba(210,225,255,0.85)');
    grad.addColorStop(1, 'rgba(120,150,255,0)');
    gc.fillStyle = grad;
    gc.fillRect(0, 0, 64, 64);
    const sm = new THREE.PointsMaterial({ color: '#D6E2FF', map: new THREE.CanvasTexture(glow), size: 18, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
    const lm = new THREE.LineBasicMaterial({ color: '#7D93E0', transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending });
    const nm = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: nebulaFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uA: { value: new THREE.Color('#1E2A78') }, uB: { value: new THREE.Color('#6D4AA8') }, uTime: { value: 0 }, uPresence: { value: 1 } },
    });
    return { points: pg, lines: lg, starMaterial: sm, lineMaterial: lm, nebula: nm };
  }, []);

  const ref = usePresence(index, (presence, frame) => {
    starMaterial.opacity = 0.9 * presence;
    lineMaterial.opacity = 0.32 * presence;
    nebula.uniforms.uTime.value = frame.time;
    nebula.uniforms.uPresence.value = presence;
  }, 1.0);

  return (
    <group ref={ref}>
      <mesh material={nebula} position={[SKILLS[0] + 3000, SKILLS[1] + 1000, SKILLS[2] - 30000]}>
        <planeGeometry args={[90000, 52000]} />
      </mesh>
      <points geometry={points} material={starMaterial} frustumCulled={false} />
      <lineSegments geometry={lines} material={lineMaterial} frustumCulled={false} />
    </group>
  );
}
