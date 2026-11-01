import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef } from '../shared/frame';
import { openInspect, registerPickable } from '../shared/pick';
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
  /** Accessible description for the inspect view. */
  alt?: string;
}

interface Props {
  position: Vec3;
  yaw: number;
  accent: string;
  /** Project name, used for the screenshots' accessible descriptions. */
  title: string;
  floorY: number;
  displays: DisplaySpec[];
  /** Teasers skip the plinth and accent light (each light costs every lit pixel). */
  bare?: boolean;
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

/** Invisible (never drawn) material for pick proxies. */
const HIT_MATERIAL = new THREE.MeshBasicMaterial({ visible: false });

/** Shared hover state for one exhibit: which display (if any) the visitor is pointing at. */
interface HoverState { index: number }

/**
 * A framed screen showing a real project capture, with a lit bezel, edge light and
 * contact shadow. It floats gently; on hover it lifts toward the visitor, its glow
 * blooms and its shadow spreads and softens (as a lifted object's would); click
 * opens it full size.
 */
function Display({ spec, index, accent, floorY, texture, hover, onSelect, floating }: {
  spec: DisplaySpec; index: number; accent: THREE.Color; floorY: number; texture: THREE.Texture;
  hover: HoverState; onSelect: (index: number) => void; floating: boolean;
}) {
  const h = spec.width / spec.aspect;
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0B0D14', metalness: 0.7, roughness: 0.32 }), []);
  const screen = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, transparent: true, opacity: 0.35 + 0.65 * spec.emphasis }), [texture, spec.emphasis]);
  const edge = useMemo(() => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 * spec.emphasis, toneMapped: false }), [accent, spec.emphasis]);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: accent, map: gradientTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), [accent]);
  const shadow = useMemo(() => new THREE.MeshBasicMaterial({ map: gradientTexture(), transparent: true, depthWrite: false, opacity: 0.8 * spec.emphasis }), [spec.emphasis]);
  const yaw = (spec.yaw * Math.PI) / 180;
  const lift = useRef<THREE.Group>(null);
  const shadowMesh = useRef<THREE.Mesh>(null);
  const screenMesh = useRef<THREE.Mesh>(null);
  const hitMesh = useRef<THREE.Mesh>(null);
  const amount = useRef(0);
  const phase = useMemo(() => index * 1.7 + spec.width * 0.01, [index, spec.width]);

  useEffect(() => {
    if (!hitMesh.current) return;
    return registerPickable({
      // Picking uses a fixed proxy at the screen's resting pose, never the lifted screen:
      // a target that moves away from the cursor on hover would flicker in and out.
      mesh: hitMesh.current,
      onHover: on => {
        hover.index = on ? index : hover.index === index ? -1 : hover.index;
        frameRef.current?.requestFrames(45);
      },
      onSelect: () => onSelect(index),
    });
  }, [hover, index, onSelect]);

  useFrame((_, delta) => {
    const f = frameRef.current;
    // Hidden with its world (presence hides meshes): nothing to animate.
    if (!f || !lift.current || screenMesh.current?.visible === false) return;
    const target = hover.index === index ? 1 : 0;
    // Critically damped-feel easing toward the hover state (~0.25 s).
    amount.current += (target - amount.current) * (1 - Math.exp(-10 * Math.min(delta, 0.05)));
    const a = amount.current;
    const others = hover.index >= 0 && hover.index !== index ? 1 : 0;
    const bob = Math.sin(f.time * 0.7 + phase) * 7;
    lift.current.position.set(0, bob + a * 36, a * 150);
    lift.current.scale.setScalar(1 + a * 0.035);
    lift.current.rotation.x = -a * 0.025;
    screen.opacity = (0.35 + 0.65 * spec.emphasis) * (1 - others * 0.35) + a * (1 - spec.emphasis) * 0.5;
    edge.opacity = Math.min(1, 0.9 * spec.emphasis + a * 0.6);
    glow.opacity = a * 0.55;
    if (shadowMesh.current) {
      shadowMesh.current.scale.setScalar(1 + a * 0.35);
      shadow.opacity = 0.8 * spec.emphasis * (1 - a * 0.45);
    }
  });

  return (
    <group position={spec.position} rotation={[0, yaw, 0]}>
      <mesh ref={hitMesh} material={HIT_MATERIAL}>
        <planeGeometry args={[spec.width + 44, h + 44]} />
      </mesh>
      <group ref={lift}>
        <mesh material={glow} position={[0, 0, -60]}>
          <planeGeometry args={[spec.width * 1.6, h * 1.9]} />
        </mesh>
        <mesh material={frame} position={[0, 0, -24]}>
          <boxGeometry args={[spec.width + 44, h + 44, 40]} />
        </mesh>
        <mesh ref={screenMesh} material={screen} position={[0, 0, -2]}>
          <planeGeometry args={[spec.width, h]} />
        </mesh>
        <mesh material={edge} position={[0, -h / 2 - 22, 0]}>
          <boxGeometry args={[spec.width * 0.92, 4, 4]} />
        </mesh>
      </group>
      {!floating && <mesh ref={shadowMesh} material={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY - spec.position[1] + 2, 60]}>
        <planeGeometry args={[spec.width * 1.5, spec.width * 0.55]} />
      </mesh>}
    </group>
  );
}

/**
 * A project installation: real application captures on framed screens in
 * depth (exploded layers), a plinth, accent light, and restrained pointer
 * parallax while the visitor reads the adjacent panel.
 */
export default function Exhibit({ position, yaw, accent, title, floorY, displays, focus, bare = false }: Props) {
  // ImageBitmapLoader decodes off the main thread (TextureLoader decodes during upload,
  // which stalls a frame per large screenshot). Bitmaps are pre-flipped, so flipY stays off.
  const bitmaps = useLoader(THREE.ImageBitmapLoader, displays.map(d => d.src), loader => {
    (loader as THREE.ImageBitmapLoader).setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' });
  }) as unknown as ImageBitmap[];
  const textures = useMemo(() => bitmaps.map(bitmap => {
    const t = new THREE.Texture(bitmap as unknown as HTMLImageElement);
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }), [bitmaps]);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);
  const keyColor = useMemo(() => new THREE.Color('#E4DEFF').lerp(accentColor, 0.12), [accentColor]);
  const group = useRef<THREE.Group>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const hover = useMemo<HoverState>(() => ({ index: -1 }), []);
  const onSelect = useMemo(() => (index: number) => openInspect(displays.map(d => ({ src: d.src, alt: d.alt ?? `${title} screenshot` })), index), [displays, title]);
  const plinth = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0A0912', metalness: 0.15, roughness: 0.85 }), []);
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
          <Display key={d.src} spec={d} index={i} accent={accentColor} floorY={floorY - position[1]} texture={textures[i]} hover={hover} onSelect={onSelect} floating={bare} />
        ))}
      </group>
      {!bare && (
        <>
          <mesh material={plinth} position={[mainX, floorY - position[1] + 60, mainZ]}>
            <cylinderGeometry args={[620, 660, 40, 64]} />
          </mesh>
          {/* Neutral key light: the project's colour stays in its details, not washed over the hall. */}
          <pointLight color={keyColor} intensity={1.1} distance={4200} decay={1.4} position={[mainX, 900, mainZ + 1600]} />
        </>
      )}
    </group>
  );
}
