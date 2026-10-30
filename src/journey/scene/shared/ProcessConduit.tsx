import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../core/math';
import { frameRef } from './frame';

/**
 * A process made visible: a fine conduit with one node per stage, and a pulse
 * that travels through it, lighting each stage as it passes. Sits under an
 * approach panel so the steps read as a flow.
 */
export default function ProcessConduit({ position, under, width: authoredWidth = 1000, stages = 5, color = '#93C5FD', period = 7 }: {
  /** Centre of the panel this conduit runs beneath (same plane). */
  position: Vec3;
  /** Panel id: the conduit hangs just below that panel's measured height and spans its content width. */
  under: string;
  width?: number; stages?: number; color?: string; period?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Mesh>(null);
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const k = useRef(1);
  const width = authoredWidth;
  const accent = useMemo(() => new THREE.Color(color), [color]);
  const { line, node, ring, pulse } = useMemo(() => ({
    line: new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    node: Array.from({ length: stages }, () => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })),
    ring: Array.from({ length: stages }, () => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })),
    pulse: new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
  }), [accent, stages]);
  const pulseRef = useRef<THREE.Mesh>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const xs = useMemo(() => Array.from({ length: stages }, (_, i) => -width / 2 + (width / stages) * (i + 0.5)), [stages, width]);

  useFrame(() => {
    const f = frameRef.current;
    if (!f || !pulseRef.current || !group.current) return;
    const size = f.panelSizes.get(under);
    if (size) {
      group.current.position.set(position[0], position[1] - size.height / 2 - 64, position[2] - 30);
      k.current = (size.width - 84) / width;
      if (lineRef.current) lineRef.current.scale.x = k.current;
      nodes.current.forEach((n, i) => { if (n) n.position.x = xs[i] * k.current; });
    }
    const t = ((f.time / period) % 1 + 1) % 1;
    const x = -width / 2 - 80 + t * (width + 160);
    pulseRef.current.position.x = x * k.current;
    xs.forEach((nx, i) => {
      // A stage glows as the pulse reaches it, then fades over the following second.
      const since = (x - nx) / (width / period);
      const lit = since >= 0 ? Math.exp(-since * 1.6) : 0;
      node[i].opacity = 0.35 + lit * 0.65;
      ring[i].opacity = lit * 0.6;
      const r = rings.current[i];
      if (r) r.scale.setScalar(1 + (1 - lit) * 1.4);
    });
  });

  return (
    <group ref={group} position={position}>
      <mesh ref={lineRef} material={line}>
        <boxGeometry args={[width + 160, 3, 3]} />
      </mesh>
      {xs.map((x, i) => (
        <group key={i} ref={el => { nodes.current[i] = el; }} position={[x, 0, 0]}>
          <mesh material={node[i]}><sphereGeometry args={[9, 16, 12]} /></mesh>
          <mesh ref={el => { rings.current[i] = el; }} material={ring[i]}><ringGeometry args={[18, 21, 48]} /></mesh>
        </group>
      ))}
      <mesh ref={pulseRef} material={pulse}>
        <sphereGeometry args={[6, 12, 10]} />
      </mesh>
    </group>
  );
}
