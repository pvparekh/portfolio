import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../core/math';
import { frameRef, usePresence } from '../shared/frame';
import Exhibit, { type DisplaySpec } from '../portfolio/Exhibit';
import { FLOOR, GALLERY_STEP, S, servicePosition } from '../../worlds/software';
import { softwareProjects } from '../../../softwareProjects';
import ProcessConduit from '../shared/ProcessConduit';

const WHITE = '#E2E8F0';
const BLUE = '#93C5FD';
const at = (base: Vec3, o: Vec3): Vec3 => [base[0] + o[0], base[1] + o[1], base[2] + o[2]];

const stone = new THREE.MeshStandardMaterial({ color: '#161B26', emissive: '#0A0F1A', roughness: 0.6, metalness: 0.3 });

/** A graphite module with a fine structural-white edge. */
function Module({ position, size, rotation = [0, 0, 0], edge = WHITE, edgeOpacity = 0.55, faces = true }: { position: Vec3; size: Vec3; rotation?: Vec3; edge?: string; edgeOpacity?: number; faces?: boolean }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);
  const line = useMemo(() => new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: edgeOpacity, depthWrite: false }), [edge, edgeOpacity]);
  return (
    <group position={position} rotation={rotation} scale={size}>
      {faces && <mesh material={stone}><boxGeometry args={[1, 1, 1]} /></mesh>}
      <lineSegments geometry={edges} material={line} />
    </group>
  );
}

/** The architectural grid floor running the length of the bench. */
export function BenchFloor() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color('#8FA3C2') } },
    vertexShader: 'varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 uColor; varying vec3 vWorld;
      void main(){
        vec2 g = vWorld.xz / 1200.0; vec2 w = fwidth(g);
        vec2 l = abs(fract(g - 0.5) - 0.5) / max(w, vec2(1e-4));
        float line = 1.0 - min(min(l.x, l.y), 1.0);
        line *= 1.0 - smoothstep(0.1, 0.6, max(w.x, w.y));
        float d = length(vWorld.xz - cameraPosition.xz);
        float a = line * 0.16 * exp(-d * 0.00006) * smoothstep(800.0, 4000.0, d);
        gl_FragColor = vec4(uColor * a, a);
        #include <colorspace_fragment>
      }`,
  }), []);
  return (
    <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} position={[80000, FLOOR, -12000]}>
      <planeGeometry args={[400000, 200000]} />
    </mesh>
  );
}

function useWorld(index: number) {
  return usePresence(index, undefined, 1.0);
}

/** Hero: the product exploded into translucent interface layers behind the UI concept. */
export function ExplodedLayers({ index }: { index: number }) {
  const ref = useWorld(index);
  const fill = useMemo(() => new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide }), []);
  const layers = [0, 1, 2, 3];
  const base = at(S.hero, [1250, 0, -1700]);
  return (
    <group ref={ref}>
      {layers.map(i => (
        <group key={i} position={at(base, [-980 - i * 360, 60 + i * 50, -1300 - i * 700])} rotation={[0, 0.3, 0]}>
          <mesh material={fill}><planeGeometry args={[600, 380]} /></mesh>
          <Module position={[0, 0, 0]} size={[600, 380, 2]} faces={false} edge={i === 0 ? WHITE : BLUE} edgeOpacity={0.5 - i * 0.09} />
        </group>
      ))}
    </group>
  );
}

/** Opportunities: a modular wall with three glowing empty slots. */
export function ModularWall({ index, gaps }: { index: number; gaps: number }) {
  const ref = useRef<THREE.Group>(null);
  const glow = useMemo(() => new THREE.LineBasicMaterial({ color: BLUE, transparent: true }), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);
  const presence = useWorld(index);
  useFrame(() => {
    const frame = frameRef.current;
    if (frame) glow.opacity = 0.7 + 0.3 * Math.sin(frame.time * 1.4);
  });
  const cols = 9;
  const rows = 4;
  // Empty slots sit in the row that shows above the reading panel.
  const empty = new Set(Array.from({ length: gaps }, (_, i) => 2 * cols + 2 + i * 2));
  return (
    <group ref={presence}>
      <group ref={ref} position={at(S.opportunities, [0, 560, -3000])}>
        {Array.from({ length: cols * rows }, (_, i) => {
          const x = (i % cols - (cols - 1) / 2) * 1500;
          const y = (Math.floor(i / cols) - (rows - 1) / 2) * 1100;
          return empty.has(i)
            ? <lineSegments key={i} geometry={edges} material={glow} position={[x, y, 0]} scale={[1340, 940, 600]} />
            : <Module key={i} position={[x, y, -((i * 37) % 5) * 60]} size={[1340, 940, 600]} edgeOpacity={0.18} />;
        })}
      </group>
    </group>
  );
}

/** Services: a distinct floating module beside each service. */
export function ServiceModules({ index, count }: { index: number; count: number }) {
  const ref = useWorld(index);
  const spin = useRef<THREE.Group>(null);
  useFrame(() => {
    const frame = frameRef.current;
    if (!frame || !spin.current) return;
    spin.current.children.forEach((child, i) => { child.rotation.y = frame.time * 0.08 + i; });
  });
  return (
    <group ref={ref}>
      <group ref={spin}>
        {Array.from({ length: count }, (_, i) => {
          const centre = at(servicePosition(i), [1200, 40, -1500]);
          const sizes: Vec3[] = [[480, 480, 480], [700, 150, 480], [260, 680, 260], [560, 260, 560], [380, 380, 640]];
          const size = sizes[i % sizes.length];
          return (
            <group key={i} position={centre}>
              <Module position={[0, 0, 0]} size={size} edge={BLUE} edgeOpacity={0.6} />
              <Module position={[0, -size[1] / 2 - 200, 0]} size={[size[0] * 1.3, 24, size[2] * 1.3]} faces={false} edgeOpacity={0.25} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

const GALLERY: Record<string, string[]> = {
  salon: ['/projects/perfect-threading-home.webp', '/projects/perfect-threading-services.webp'],
  formula: ['/projects/formula-vision-replay-map.webp', '/projects/formula-vision-chase-camera.webp'],
  aetherflow: ['/projects/aetherflow-home.webp', '/projects/aetherflow-signup.webp'],
  'review-bot': ['/projects/review-bot-pipeline.webp', '/projects/review-bot-engineering.webp'],
  biaslens: ['/projects/biaslens-dashboard.webp', '/projects/biaslens-table.webp'],
};

/** Beside the work intro: a floating preview of the applications ahead. */
const WORK_TEASER: DisplaySpec[] = [
  { src: '/projects/perfect-threading-home.webp', position: [930, 30, -1500], width: 640, yaw: -14, aspect: 1.6, emphasis: 1, alt: 'Perfect Threading Salon screenshot' },
  { src: '/projects/formula-vision-replay-map.webp', position: [1360, 420, -2700], width: 560, yaw: -18, aspect: 1.6, emphasis: 0.6, alt: 'Formula Vision screenshot' },
  { src: '/projects/biaslens-dashboard.webp', position: [1240, -480, -2600], width: 540, yaw: -16, aspect: 1.6, emphasis: 0.5, alt: 'BiasLens screenshot' },
];

/** Work: a gallery of real applications, each on a framed screen beside its case. */
export function Gallery({ index }: { index: number }) {
  const ref = useWorld(index);
  return (
    <group ref={ref}>
      <hemisphereLight args={['#B8C6DD', '#06070A', 0.5]} position={S.work} />
      <Suspense fallback={null}>
        <Exhibit position={S.work} yaw={0} accent={WHITE} title="Selected software" floorY={FLOOR} displays={WORK_TEASER} focus={shot => shot === 0} bare />
        {softwareProjects.map((project, i) => {
          const sources = GALLERY[project.id];
          if (!sources) return null;
          const aspect = project.id === 'review-bot' ? 1257 / 740 : 1.6;
          const displays: DisplaySpec[] = [
            { src: sources[0], position: [900, 40, -900], width: 600, yaw: -18, aspect, emphasis: 1 },
            { src: sources[1], position: [1120, 500, -1900], width: 500, yaw: -22, aspect: project.id === 'review-bot' ? 1257 / 680 : 1.6, emphasis: 0.45 },
          ];
          const position = at(S.work, [(i + 1) * GALLERY_STEP, 0, -(i % 2) * 700]);
          return <Exhibit key={project.id} position={position} yaw={4} accent={i === 0 ? '#F59E0B' : WHITE} title={project.title} floorY={FLOOR} displays={displays} focus={shot => shot === i + 1} />;
        })}
      </Suspense>
    </group>
  );
}

/** Approach: five slabs closing into one assembled stack. */
export function AssemblyStack({ index }: { index: number }) {
  const ref = useWorld(index);
  return (
    <group ref={ref}>
      <ProcessConduit position={S.approach} under="sw-approach" color={BLUE} />
      {Array.from({ length: 5 }, (_, i) => (
        <Module key={i} position={at(S.approach, [0, -1600 + i * (360 + (4 - i) * 140), -6200])} size={[5200 - i * 300, 220, 2600]} edge={i === 4 ? WHITE : BLUE} edgeOpacity={0.35 + i * 0.1} />
      ))}
    </group>
  );
}

/** Contact: an open slot waiting for the next module. */
export function OpenSlot({ index }: { index: number }) {
  const ref = useWorld(index);
  const glow = useMemo(() => new THREE.LineBasicMaterial({ color: '#F5A524', transparent: true }), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);
  useFrame(() => {
    const frame = frameRef.current;
    if (frame) glow.opacity = 0.5 + 0.3 * Math.sin(frame.time * 1.2);
  });
  return (
    <group ref={ref}>
      <Module position={at(S.contact, [-1800, -400, -5200])} size={[1500, 1500, 1500]} edgeOpacity={0.35} />
      <Module position={at(S.contact, [1800, -400, -5200])} size={[1500, 1500, 1500]} edgeOpacity={0.35} />
      <lineSegments geometry={edges} material={glow} position={at(S.contact, [0, -400, -5200])} scale={[1500, 1500, 1500]} />
    </group>
  );
}
