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
    const sizes: number[] = [];
    const segments: number[] = [];
    // One constellation per skill group, set in the margins around the panel so they
    // are actually in frame at the reading position (depth 3600 behind the panel:
    // 1 px on screen is ~3.3 world units there).
    const slots: [number, number][] = [[-1760, 1160], [0, 1260], [1760, 1160], [-1760, -1160], [0, -1260], [1760, -1160]];
    const centres: THREE.Vector3[] = [];
    for (let g = 0; g < GROUPS; g++) {
      const [sx, sy] = slots[g];
      const centre = new THREE.Vector3(SKILLS[0] + sx, SKILLS[1] + sy, SKILLS[2] - 3600 - (g % 2) * 500);
      centres.push(centre);
      const count = 5 + Math.round(r() * 3);
      const cluster: THREE.Vector3[] = [];
      for (let i = 0; i < count; i++) {
        const p = centre.clone().add(new THREE.Vector3((r() - 0.5) * 1150, (r() - 0.5) * 420, (r() - 0.5) * 500));
        cluster.push(p);
        stars.push(p.x, p.y, p.z);
        sizes.push(i === 0 ? 9 : 4 + r() * 4);
      }
      // A path through the cluster, nearest-neighbour ordered so lines read as a figure.
      cluster.sort((a, b) => a.x - b.x);
      for (let i = 1; i < cluster.length; i++) segments.push(...cluster[i - 1].toArray(), ...cluster[i].toArray());
    }
    // Deep field: mostly tiny, a few brighter.
    for (let i = 0; i < 1400; i++) {
      stars.push(SKILLS[0] + (r() - 0.5) * 60000, SKILLS[1] + (r() - 0.5) * 30000, SKILLS[2] - 9000 - r() * 40000);
      const v = r();
      sizes.push(1 + v * v * v * 5);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
    pg.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
    const sm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uScale: { value: 1 }, uColor: { value: new THREE.Color('#D6E2FF') } },
      vertexShader: `uniform float uTime; uniform float uScale; attribute float aSize; varying float vTwinkle;
        void main() {
          float seed = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453);
          vTwinkle = 0.7 + 0.3 * sin(uTime * (0.6 + seed * 1.4) + seed * 40.0);
          gl_PointSize = aSize * uScale;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vTwinkle;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float core = smoothstep(1.0, 0.0, d);
          float a = core * core * vTwinkle * uOpacity;
          gl_FragColor = vec4(uColor * a, a);
        }`,
    });
    const lm = new THREE.LineBasicMaterial({ color: '#7D93E0', transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
    const nm = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: nebulaFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uA: { value: new THREE.Color('#1E2A78') }, uB: { value: new THREE.Color('#6D4AA8') }, uTime: { value: 0 }, uPresence: { value: 1 } },
    });
    return { points: pg, lines: lg, starMaterial: sm, lineMaterial: lm, nebula: nm };
  }, []);

  const ref = usePresence(index, (presence, frame) => {
    starMaterial.uniforms.uOpacity.value = presence;
    starMaterial.uniforms.uTime.value = frame.time;
    starMaterial.uniforms.uScale.value = Math.min(window.devicePixelRatio, 2);
    lineMaterial.opacity = 0.4 * presence;
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
