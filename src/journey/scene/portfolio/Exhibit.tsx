import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef } from '../shared/frame';
import type { Vec3 } from '../../core/math';

export interface DisplaySpec {
  src: string;
  /** Position in the exhibit's local frame (x right, y up, z toward the viewer). */
  position: Vec3;
  width: number;
  /** Extra yaw in degrees relative to the exhibit. */
  yaw: number;
  aspect: number;
  /** 1 = primary screen; lower values recede (exploded layers). */
  emphasis: number;
}

interface Props {
  position: Vec3;
  yaw: number;
  accent: string;
  floorY: number;
  displays: DisplaySpec[];
  /** Index into the destination shots during which this exhibit is the focus (for pointer response). */
  focus: (shot: number) => boolean;
}

const gradientTexture = (() => {
  let cache: THREE.Texture | null = null;
  return () => {
    if (cache) return cache;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    cache = new THREE.CanvasTexture(c);
    return cache;
  };
})();

/** A framed screen showing a real project capture, with a lit bezel, edge light and contact shadow. */
function Display({ spec, accent, floorY, texture }: { spec: DisplaySpec; accent: THREE.Color; floorY: number; texture: THREE.Texture }) {
  const h = spec.width / spec.aspect;
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0B0D14', metalness: 0.7, roughness: 0.32 }), []);
  const screen = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, transparent: spec.emphasis < 1, opacity: 0.35 + 0.65 * spec.emphasis }), [texture, spec.emphasis]);
  const edge = useMemo(() => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 * spec.emphasis, toneMapped: false }), [accent, spec.emphasis]);
  const shadow = useMemo(() => new THREE.MeshBasicMaterial({ map: gradientTexture(), transparent: true, depthWrite: false, opacity: 0.8 * spec.emphasis }), [spec.emphasis]);
  const yaw = (spec.yaw * Math.PI) / 180;
  return (
    <group position={spec.position} rotation={[0, yaw, 0]}>
      <mesh material={frame} position={[0, 0, -24]}>
        <boxGeometry args={[spec.width + 44, h + 44, 40]} />
      </mesh>
      <mesh material={screen} position={[0, 0, -2]}>
        <planeGeometry args={[spec.width, h]} />
      </mesh>
      <mesh material={edge} position={[0, -h / 2 - 22, 0]}>
        <boxGeometry args={[spec.width * 0.92, 4, 4]} />
      </mesh>
      <mesh material={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY - spec.position[1] + 2, 0]}>
        <planeGeometry args={[spec.width * 1.5, spec.width * 0.55]} />
      </mesh>
    </group>
  );
}

/**
 * A project installation: real application captures on framed screens in
 * depth (exploded layers), a plinth, accent light, and restrained pointer
 * parallax while the visitor reads the adjacent panel.
 */
export default function Exhibit({ position, yaw, accent, floorY, displays, focus }: Props) {
  const textures = useLoader(THREE.TextureLoader, displays.map(d => d.src));
  useMemo(() => textures.forEach(t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; }), [textures]);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);
  const group = useRef<THREE.Group>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const plinth = useMemo(() => new THREE.MeshStandardMaterial({ color: '#07070C', metalness: 0.5, roughness: 0.4 }), []);
  const yawRad = (yaw * Math.PI) / 180;
  // Main display position rotated into world orientation (for plinth and light).
  const [dx, , dz] = displays[0].position;
  const mainX = dx * Math.cos(yawRad) + dz * Math.sin(yawRad);
  const mainZ = -dx * Math.sin(yawRad) + dz * Math.cos(yawRad);

  useFrame(() => {
    const frame = frameRef.current;
    if (!frame || !group.current) return;
    const active = frame.segment?.kind === 'dwell' && focus(frame.segment.shot);
    const tx = active ? frame.pointer[0] * 0.035 : 0;
    const ty = active ? frame.pointer[1] * 0.018 : 0;
    tilt.current.x += (tx - tilt.current.x) * 0.08;
    tilt.current.y += (ty - tilt.current.y) * 0.08;
    group.current.rotation.set(tilt.current.y, yawRad + tilt.current.x, 0);
  });

  return (
    <group position={position}>
      <group ref={group} rotation={[0, yawRad, 0]}>
        {displays.map((d, i) => (
          <Display key={d.src} spec={d} accent={accentColor} floorY={floorY - position[1]} texture={textures[i]} />
        ))}
      </group>
      <mesh material={plinth} position={[mainX, floorY - position[1] + 60, mainZ]}>
        <cylinderGeometry args={[620, 660, 40, 64]} />
      </mesh>
      <pointLight color={accentColor} intensity={3.2} distance={4200} decay={1.4} position={[mainX, 900, mainZ + 1600]} />
    </group>
  );
}
