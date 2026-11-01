import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePresence } from '../shared/frame';
import { EXPERIENCE, ROLE_COUNT, ROLE_SPACING } from '../../worlds/portfolio';

const FLOOR = EXPERIENCE[1] - 1700;
const ROWS = 18;
const STEP = 2700;
const HALF_WIDTH = 4600;

/**
 * Experience: a monumental colonnade. Dark stone monoliths line an
 * illuminated path; each role sits at a lit threshold along it, so the
 * journey through a career is a walk through architecture.
 */
export default function ExperienceWorld({ index }: { index: number }) {
  const monoliths = useRef<THREE.InstancedMesh>(null);
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141922', roughness: 0.86, metalness: 0.08 }), []);
  const floor = useMemo(() => new THREE.MeshStandardMaterial({ color: '#040508', roughness: 0.92, metalness: 0.05 }), []);
  // The path's rails carry pulses of light down the colonnade, toward the roles.
  const path = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uColor: { value: new THREE.Color('#9FC6E8') }, uTime: { value: 0 }, uPresence: { value: 1 } },
    vertexShader: 'varying float vZ; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vZ = w.z; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uTime; uniform float uPresence; varying float vZ; void main(){ float pulse = pow(fract(-vZ / 3200.0 - uTime * 0.22), 14.0); float a = (0.45 + 0.55 * pulse) * uPresence; gl_FragColor = vec4(uColor * (1.0 + pulse * 1.5), a); }',
  }), []);
  // Light inlays on each monolith's inner face; a slow wave of light travels down the colonnade.
  const inlay = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uColor: { value: new THREE.Color('#8FB8E8') }, uTime: { value: 0 }, uPresence: { value: 1 } },
    vertexShader: 'varying vec3 vWorld; varying float vV; void main(){ vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); vWorld = w.xyz; vV = position.y + 0.5; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uTime; uniform float uPresence; varying vec3 vWorld; varying float vV; void main(){ float wave = pow(0.5 + 0.5 * sin(vWorld.z * 0.0011 + uTime * 0.7), 5.0); float fade = smoothstep(0.0, 0.25, vV) * (1.0 - smoothstep(0.7, 1.0, vV)); float a = (0.16 + 0.75 * wave) * fade * uPresence; gl_FragColor = vec4(uColor * a, a); }',
  }), []);
  const inlays = useRef<THREE.InstancedMesh>(null);
  const threshold = useMemo(() => new THREE.MeshBasicMaterial({ color: '#CFE3F7', toneMapped: false, transparent: true, opacity: 0.85 }), []);
  const current = useMemo(() => new THREE.MeshBasicMaterial({ color: '#4ADE80', toneMapped: false, transparent: true, opacity: 0.85 }), []);

  useLayoutEffect(() => {
    const mesh = monoliths.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (const side of [-1, 1]) {
        const h = 9000 + ((r * 7 + (side > 0 ? 3 : 0)) % 5) * 1400;
        m.compose(
          new THREE.Vector3(EXPERIENCE[0] + side * (HALF_WIDTH + (r % 3) * 120), FLOOR + h / 2, EXPERIENCE[2] + 7000 - r * STEP),
          new THREE.Quaternion(),
          new THREE.Vector3(900, h, 900),
        );
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    // Inlays: a thin strip down the centre of each monolith's face toward the path.
    const strips = inlays.current;
    if (!strips) return;
    let j = 0;
    for (let r = 0; r < ROWS; r++) {
      for (const side of [-1, 1]) {
        const h = 9000 + ((r * 7 + (side > 0 ? 3 : 0)) % 5) * 1400;
        m.compose(
          new THREE.Vector3(EXPERIENCE[0] + side * (HALF_WIDTH + (r % 3) * 120 - 472), FLOOR + h * 0.45, EXPERIENCE[2] + 7000 - r * STEP),
          new THREE.Quaternion(),
          new THREE.Vector3(16, h * 0.8, 60),
        );
        strips.setMatrixAt(j++, m);
      }
    }
    strips.instanceMatrix.needsUpdate = true;
  }, []);

  const ref = usePresence(index, (presence, frame) => {
    path.uniforms.uPresence.value = presence;
    path.uniforms.uTime.value = frame.time;
    inlay.uniforms.uPresence.value = presence;
    inlay.uniforms.uTime.value = frame.time;
    threshold.opacity = 0.85 * presence;
    current.opacity = (0.55 + 0.3 * Math.sin(frame.time * 1.6)) * presence;
  }, 1.0);

  return (
    <group ref={ref}>
      <hemisphereLight args={['#93A9C9', '#05070B', 0.55]} position={EXPERIENCE} />
      <directionalLight color="#BFD3F2" intensity={0.7} position={[EXPERIENCE[0] - 9000, EXPERIENCE[1] + 16000, EXPERIENCE[2] + 12000]} />
      {/* Cool back light down the colonnade gives the monoliths lit edges. */}
      <directionalLight color="#7FB2E6" intensity={1.6} position={[EXPERIENCE[0] + 3000, EXPERIENCE[1] + 4000, EXPERIENCE[2] - 60000]} />
      <instancedMesh ref={monoliths} args={[undefined, undefined, ROWS * 2]} material={stone}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={inlays} args={[undefined, undefined, ROWS * 2]} material={inlay} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <mesh material={floor} rotation={[-Math.PI / 2, 0, 0]} position={[EXPERIENCE[0], FLOOR, EXPERIENCE[2] - 18000]}>
        <planeGeometry args={[60000, 80000]} />
      </mesh>
      {/* The illuminated path. */}
      {[-1, 1].map(side => (
        <mesh key={side} material={path} position={[EXPERIENCE[0] + side * 900, FLOOR + 4, EXPERIENCE[2] - 18000]}>
          <boxGeometry args={[18, 6, 56000]} />
        </mesh>
      ))}
      {/* A lit threshold at every role; the current role's glows green, as on the page. */}
      {Array.from({ length: ROLE_COUNT }, (_, i) => (
        <group key={i} position={[EXPERIENCE[0], FLOOR, EXPERIENCE[2] - (i + 1) * ROLE_SPACING]}>
          <mesh material={i === 0 ? current : threshold} position={[0, 6, 0]}>
            <boxGeometry args={[HALF_WIDTH * 2 - 1400, 8, 26]} />
          </mesh>
          <mesh material={i === 0 ? current : threshold} position={[-HALF_WIDTH + 700, 3200, 0]}>
            <boxGeometry args={[14, 6400, 14]} />
          </mesh>
          <mesh material={i === 0 ? current : threshold} position={[HALF_WIDTH - 700, 3200, 0]}>
            <boxGeometry args={[14, 6400, 14]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
