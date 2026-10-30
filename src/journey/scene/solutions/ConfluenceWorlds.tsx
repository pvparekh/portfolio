import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../core/math';
import { frameRef, usePresence } from '../shared/frame';
import StreamField, { type Stream } from '../shared/StreamField';
import { D } from '../../worlds/solutions';
import Exhibit, { type DisplaySpec } from '../portfolio/Exhibit';

/** Beside the products intro: the independent products, floating (hover lifts, click inspects). */
const PRODUCT_TEASER: DisplaySpec[] = [
  { src: '/projects/formula-vision-replay-map.webp', position: [930, 30, -1500], width: 660, yaw: -14, aspect: 1.6, emphasis: 1, alt: 'Formula Vision screenshot' },
  { src: '/projects/aetherflow-home.webp', position: [1320, 380, -2700], width: 580, yaw: -18, aspect: 1.6, emphasis: 0.6, alt: 'AetherFlow screenshot' },
];

/* Colour carries meaning on this page: amber is raw, manual data; cyan is validated. */
const RAW = '#C9822F';
const VALID = '#5EE6F0';
const CALM = '#7DD3FC';

const at = (base: Vec3, o: Vec3): Vec3 => [base[0] + o[0], base[1] + o[1], base[2] + o[2]];

/** Shared presence holder so stream brightness follows the destination's visibility. */
function useWorld(index: number) {
  const presence = useRef(0);
  const ref = usePresence(index, p => { presence.current = p; }, 1.0);
  return { ref, presence: () => presence.current };
}

function knot(center: Vec3, radius: number, turns = 3): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    const k = Math.cos(turns * t) + 2.2;
    pts.push([center[0] + k * Math.cos(2 * t) * radius / 3.2, center[1] + k * Math.sin(2 * t) * radius / 3.2, center[2] - Math.sin(turns * t) * radius / 3.2]);
  }
  return pts;
}

function circle(center: Vec3, radius: number, segments = 20): Vec3[] {
  return Array.from({ length: segments }, (_, i) => {
    const t = (i / segments) * Math.PI * 2;
    return [center[0] + Math.cos(t) * radius, center[1], center[2] + Math.sin(t) * radius] as Vec3;
  });
}

/** A crystalline processing lattice: octahedra on a grid, slowly turning. */
function Lattice({ position, scale = 1, color = VALID }: { position: Vec3; scale?: number; color?: string }) {
  const group = useRef<THREE.Group>(null);
  const { geometry, material } = useMemo(() => {
    const base = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(520));
    const src = base.attributes.position.array as Float32Array;
    const out: number[] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 2) continue;
      for (let i = 0; i < src.length; i += 3) out.push(src[i] + x * 1200, src[i + 1] + y * 1200, src[i + 2] + z * 1200);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
    return { geometry: g, material: new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }) };
  }, [color]);
  useFrame(() => {
    const frame = frameRef.current;
    if (frame && group.current) group.current.rotation.y = frame.time * 0.05;
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

/** Emissive frame (gate or ring) used for validation and process steps. */
function Gate({ position, width, height, color, ring = false }: { position: Vec3; width: number; height: number; color: string; ring?: boolean }) {
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, toneMapped: false }), [color]);
  if (ring) {
    return <mesh material={material} position={position}><torusGeometry args={[width / 2, 10, 6, 96]} /></mesh>;
  }
  return (
    <group position={position}>
      <mesh material={material} position={[0, height, 0]}><boxGeometry args={[width, 14, 14]} /></mesh>
      <mesh material={material} position={[-width / 2, height / 2, 0]}><boxGeometry args={[14, height, 14]} /></mesh>
      <mesh material={material} position={[width / 2, height / 2, 0]}><boxGeometry args={[14, height, 14]} /></mesh>
    </group>
  );
}

export function HeroConfluence({ index }: { index: number }) {
  const { ref, presence } = useWorld(index);
  const gate = at(D.hero, [2600, -3400, -17000]);
  const streams = useMemo<Stream[]>(() => {
    const sources: Vec3[] = [[-16000, 3000, -6000], [-11000, -6000, -14000], [12000, 5000, -4000], [16000, -4000, -16000], [-2000, 9000, -18000]];
    const raw = sources.map(s => ({
      points: [at(D.hero, s), at(D.hero, [s[0] * 0.55, s[1] * 0.4 - 1400, -9000 + s[2] * 0.1]), at(gate, [s[0] * 0.08, 0, 600]), gate],
      count: 260, color: RAW, speed: 0.05, width: 520, chaos: 0.9, length: 260, brightness: 0.75,
    }));
    const out = [-900, 0, 900].map(x => ({
      points: [gate, at(gate, [x, -200, -6000]), at(gate, [x * 1.4, -400, -16000]), at(gate, [x * 2, -600, -30000])],
      count: 220, color: VALID, speed: 0.04, width: 60, chaos: 0, length: 340, brightness: 1,
    }));
    return [...raw, ...out];
  }, [gate]);
  return (
    <group ref={ref}>
      <StreamField streams={streams} presence={presence} />
      <Lattice position={gate} scale={0.8} />
    </group>
  );
}

export function ProblemTangles({ index }: { index: number }) {
  const { ref, presence } = useWorld(index);
  const streams = useMemo<Stream[]>(() => [-1, 0, 1].map(i => ({
    points: knot(at(D.problems, [i * 5200, 2400 - Math.abs(i) * 600, -6500]), 2600 + Math.abs(i) * 300),
    closed: true, count: 340, color: RAW, speed: 0.03, width: 300, chaos: 1, length: 220, brightness: 0.8,
  })), []);
  return <group ref={ref}><StreamField streams={streams} presence={presence} /></group>;
}

export function ServiceChannels({ index, count }: { index: number; count: number }) {
  const { ref, presence } = useWorld(index);
  const streams = useMemo<Stream[]>(() => Array.from({ length: count }, (_, i) => ({
    points: [at(D.services, [(i - (count - 1) / 2) * 1500, -2400, 8000]), at(D.services, [(i - (count - 1) / 2) * 1700, -2400, -12000]), at(D.services, [(i - (count - 1) / 2) * 1900, -2400, -34000])],
    count: 240, color: VALID, speed: 0.035, width: 70, chaos: 0, length: 420,
  })), [count]);
  return (
    <group ref={ref}>
      <StreamField streams={streams} presence={presence} />
      <Lattice position={at(D.services, [0, 3600, -16000])} scale={0.7} color={CALM} />
    </group>
  );
}

export function ValidationRings({ index, count }: { index: number; count: number }) {
  const { ref, presence } = useWorld(index);
  const streams = useMemo<Stream[]>(() => [
    { points: [at(D.work, [-4000, -1800, 6000]), at(D.work, [-1500, -2000, -4000]), at(D.work, [0, -2000, -(count + 1) * 5000])], count: 220, color: RAW, speed: 0.03, width: 260, chaos: 0.7, length: 260, brightness: 0.7 },
    ...[-500, 500].map(x => ({ points: [at(D.work, [x, -2000, -3000]), at(D.work, [x, -2000, -14000]), at(D.work, [x, -2000, -(count + 2) * 5000])], count: 200, color: VALID, speed: 0.035, width: 40, chaos: 0, length: 380 })),
  ], [count]);
  return (
    <group ref={ref}>
      <StreamField streams={streams} presence={presence} />
      {Array.from({ length: count + 1 }, (_, i) => (
        <Gate key={i} ring position={at(D.work, [0, -2000, -(i + 1) * 5000 + 2500])} width={1500} height={0} color={i === 0 ? RAW : VALID} />
      ))}
    </group>
  );
}

export function ProcessAqueduct({ index }: { index: number }) {
  const { ref, presence } = useWorld(index);
  const streams = useMemo<Stream[]>(() => [{
    points: [at(D.approach, [0, -2600, 6000]), at(D.approach, [0, -2600, -10000]), at(D.approach, [0, -2600, -30000])],
    count: 260, color: VALID, speed: 0.03, width: 50, chaos: 0, length: 400,
  }], []);
  return (
    <group ref={ref}>
      <StreamField streams={streams} presence={presence} />
      {Array.from({ length: 5 }, (_, i) => (
        <Gate key={i} position={at(D.approach, [0, -2700, -2500 - i * 3200])} width={9000 - i * 900} height={5200 - i * 500} color={CALM} />
      ))}
    </group>
  );
}

export function ProductDelta({ index, branches }: { index: number; branches: number }) {
  const { ref, presence } = useWorld(index);
  const streams = useMemo<Stream[]>(() => Array.from({ length: branches }, (_, i) => {
    const side = branches === 1 ? 0 : (i / (branches - 1)) * 2 - 1;
    return {
      points: [at(D.independent, [0, -2600, 7000]), at(D.independent, [0, -2600, -2000]), at(D.independent, [side * 3500, -2600, -12000]), at(D.independent, [side * 9000, -2600, -26000])],
      count: 260, color: '#A5B4FC', speed: 0.03, width: 60, chaos: 0, length: 380,
    };
  }), [branches]);
  return (
    <group ref={ref}>
      <StreamField streams={streams} presence={presence} />
      <hemisphereLight args={['#A5B4FC', '#05060A', 0.5]} position={D.independent} />
      <Suspense fallback={null}>
        <Exhibit position={D.independent} yaw={0} accent="#A5B4FC" title="Products" floorY={D.independent[1] - 2600} displays={PRODUCT_TEASER} focus={shot => shot === 0} bare />
      </Suspense>
    </group>
  );
}

export function Reservoir({ index }: { index: number }) {
  const { ref, presence } = useWorld(index);
  const streams = useMemo<Stream[]>(() => [2600, 4200, 6000, 8200].map((r, i) => ({
    points: circle(at(D.contact, [0, -2600, -5200]), r), closed: true,
    count: 160 + i * 60, color: i % 2 ? CALM : VALID, speed: 0.01 + 0.004 * (3 - i), width: 40, chaos: 0, length: 300, brightness: 0.8,
  })), []);
  return <group ref={ref}><StreamField streams={streams} presence={presence} /></group>;
}
