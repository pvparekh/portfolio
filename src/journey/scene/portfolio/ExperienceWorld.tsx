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
  const path = useMemo(() => new THREE.MeshBasicMaterial({ color: '#9FC6E8', toneMapped: false, transparent: true, opacity: 0.55 }), []);
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
  }, []);

  const ref = usePresence(index, (presence, frame) => {
    path.opacity = 0.55 * presence;
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
