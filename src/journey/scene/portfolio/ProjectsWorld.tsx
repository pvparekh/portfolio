import { Suspense, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { usePresence } from '../shared/frame';
import { EXHIBITS, PROJECTS } from '../../worlds/portfolio';
import Exhibit, { type DisplaySpec } from './Exhibit';

const FLOOR_Y = PROJECTS[1] - 1500;

// Displays sit to the right of each info panel, angled toward the reading camera.
const FV_DISPLAYS: DisplaySpec[] = [
  { src: '/projects/formula-vision-replay-map.webp', position: [820, 40, -700], width: 780, yaw: -22, aspect: 1.6, emphasis: 1 },
  { src: '/projects/formula-vision-chase-camera.webp', position: [1180, 560, -1750], width: 620, yaw: -26, aspect: 1.6, emphasis: 0.5 },
  { src: '/projects/formula-vision-archive.webp', position: [560, -500, -1950], width: 560, yaw: -16, aspect: 1.6, emphasis: 0.36 },
];
const BOT_DISPLAYS: DisplaySpec[] = [
  { src: '/projects/review-bot-pipeline.webp', position: [820, 20, -700], width: 760, yaw: -22, aspect: 1257 / 740, emphasis: 1 },
  { src: '/projects/review-bot-engineering.webp', position: [1180, 560, -1750], width: 620, yaw: -26, aspect: 1257 / 680, emphasis: 0.5 },
];
const AETHER_DISPLAYS: DisplaySpec[] = [
  { src: '/projects/aetherflow-home.webp', position: [820, 40, -700], width: 780, yaw: -22, aspect: 1.6, emphasis: 1 },
  { src: '/projects/aetherflow-features.webp', position: [1180, 560, -1750], width: 620, yaw: -26, aspect: 1.6, emphasis: 0.5 },
];

/** A real planar reflection (half resolution), tinted dark so it reads as polished stone. */
function ReflectiveFloor() {
  const { size, viewport } = useThree();
  const reflector = useMemo(() => {
    const narrow = size.width < 820;
    const r = new Reflector(new THREE.PlaneGeometry(40000, 30000), {
      textureWidth: Math.round(size.width * viewport.dpr * (narrow ? 0.35 : 0.5)),
      textureHeight: Math.round(size.height * viewport.dpr * (narrow ? 0.35 : 0.5)),
      color: new THREE.Color('#4A4560'),
      clipBias: 0.003,
    });
    r.rotation.x = -Math.PI / 2;
    return r;
  }, [size.width, size.height, viewport.dpr]);
  useEffect(() => () => { reflector.dispose(); }, [reflector]);
  // Reflections read near the exhibits; with distance the floor melts into the hall's haze (no hard horizon).
  const veil = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // Far colour matches the sky dome's horizon (atmosphere x 0.55) through the same tone mapping.
    uniforms: { uNear: { value: new THREE.Color('#06040C') }, uFar: { value: new THREE.Color('#1C1236').multiplyScalar(0.55) } },
    vertexShader: 'varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 uNear; uniform vec3 uFar; varying vec3 vWorld; void main(){ float d = length(vWorld.xz - cameraPosition.xz); float t = smoothstep(2500.0, 22000.0, d); vec3 c = mix(uNear, uFar, pow(t, 0.6)); float a = mix(0.5, 1.0, smoothstep(0.0, 0.35, t)); gl_FragColor = vec4(c, a); \n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  }), []);
  return (
    <group position={[PROJECTS[0], FLOOR_Y, PROJECTS[2] - 8000]}>
      <primitive object={reflector} />
      <mesh material={veil} rotation={[-Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
        <planeGeometry args={[700000, 700000]} />
      </mesh>
    </group>
  );
}

/** Tall, faint light planes give the hall vertical scale without real volumetrics. */
function HallLight() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color('#6D5BD0') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uColor; varying vec2 vUv; void main(){ float a = (1.0 - abs(vUv.x - 0.5) * 2.0) * smoothstep(0.0, 0.6, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y)) * 0.08; gl_FragColor = vec4(uColor * a, a); }',
    side: THREE.DoubleSide,
  }), []);
  const beams = [-14000, -5000, 4000, 13000, 21000];
  return (
    <group position={[PROJECTS[0], FLOOR_Y, PROJECTS[2] - 14000]}>
      {beams.map((x, i) => (
        <mesh key={x} material={material} position={[x, 9000, -i * 1200]}>
          <planeGeometry args={[2600, 18000]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Projects: a dimensional exhibition. A dark violet hall with a reflective
 * floor; each project is an installation of real captures in framed screens.
 */
export default function ProjectsWorld({ index }: { index: number }) {
  const ref = usePresence(index, undefined, 1.0);
  return (
    <group ref={ref}>
      <hemisphereLight args={['#4B3F8F', '#05040A', 0.6]} position={PROJECTS} />
      <ReflectiveFloor />
      <HallLight />
      <Suspense fallback={null}>
        <Exhibit position={EXHIBITS.fv.info} yaw={EXHIBITS.fv.yaw} accent={EXHIBITS.fv.accent} floorY={FLOOR_Y} displays={FV_DISPLAYS} focus={shot => shot === 1 || shot === 2} />
        <Exhibit position={EXHIBITS.bot.info} yaw={EXHIBITS.bot.yaw} accent={EXHIBITS.bot.accent} floorY={FLOOR_Y} displays={BOT_DISPLAYS} focus={shot => shot === 3} />
        <Exhibit position={EXHIBITS.aether.info} yaw={EXHIBITS.aether.yaw} accent={EXHIBITS.aether.accent} floorY={FLOOR_Y} displays={AETHER_DISPLAYS} focus={shot => shot === 4} />
      </Suspense>
    </group>
  );
}
