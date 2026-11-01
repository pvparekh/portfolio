import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef, usePresence } from '../shared/frame';
import { EXHIBITS, PROJECTS, local, portfolioJourney } from '../../worlds/portfolio';
import Exhibit, { type DisplaySpec } from './Exhibit';
import { LITE } from '../../core/budget';

const PROJECTS_INDEX = portfolioJourney.destinations.findIndex(d => d.id === 'projects');

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
  { src: '/projects/aetherflow-signup.webp', position: [1180, 560, -1750], width: 620, yaw: -26, aspect: 1.6, emphasis: 0.5 },
];

/** Where each project's main screen stands (its floor pool and plinth sit under it). */
const STATIONS = [EXHIBITS.fv, EXHIBITS.bot, EXHIBITS.aether].map(e => local(e.info, e.yaw, [820, 0, -700]));
/** Which exhibit each Projects shot reads (shot 0 is the overview). */
const SHOT_STATION = [-1, 0, 0, 1, 2];

/**
 * The exhibition floor, designed as one installation (museum lighting hierarchy):
 * - general light: a single platform whose engraved border and walkway line join
 *   all three projects, so on approach the section reads as one designed group;
 * - focal light: a neutral pool under each project, equal at the overview, then
 *   the project being read brightens while the others recede;
 * - project colour only as a fine ring at each plinth, a detail rather than a wash.
 * Unlit and a single pass (a planar reflector re-rendered the whole scene).
 */
function ExhibitionFloor() {
  const floor = useMemo(() => {
    const centre = STATIONS.reduce((c, p) => c.add(new THREE.Vector2(p[0], p[2]).divideScalar(STATIONS.length)), new THREE.Vector2());
    return new THREE.ShaderMaterial({
      extensions: { derivatives: true } as never,
      uniforms: {
        uBase: { value: new THREE.Color('#0A0814') },
        uKey: { value: new THREE.Color('#D9D3FF') },
        uPos: { value: STATIONS.map(p => new THREE.Vector2(p[0], p[2])) },
        uAccent: { value: [EXHIBITS.fv, EXHIBITS.bot, EXHIBITS.aether].map(e => new THREE.Color(e.accent)) },
        uFocus: { value: [0.5, 0.5, 0.5] },
        uCentre: { value: centre },
        uRadii: { value: new THREE.Vector2(12500, 6400) },
        uTime: { value: 0 },
      },
      vertexShader: 'varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform vec3 uBase; uniform vec3 uKey; uniform vec2 uPos[3]; uniform vec3 uAccent[3]; uniform float uFocus[3];
        uniform vec2 uCentre; uniform vec2 uRadii; uniform float uTime; varying vec3 vWorld;
        float band(float d, float w) { return 1.0 - smoothstep(w, w + fwidth(d) * 1.5, abs(d)); }
        float segment(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
        void main() {
          vec2 p = vWorld.xz;
          vec3 c = uBase;
          // The platform: polished, slightly lighter stone inside an engraved double border.
          float e = length((p - uCentre) / uRadii);
          float inside = 1.0 - smoothstep(0.97, 1.0, e);
          c += uKey * 0.018 * inside;
          c += uKey * (band(e - 1.0, 0.0016) * 0.22 + band(e - 0.955, 0.0009) * 0.08);
          // The walkway: one fine line joining the projects in reading order, a soft light travelling it.
          float route = min(segment(p, uPos[0], uPos[1]), segment(p, uPos[1], uPos[2]));
          float along = fract(dot(p - uPos[0], normalize(uPos[2] - uPos[0])) / 2400.0 - uTime * 0.05);
          c += uKey * band(route, 5.0) * (0.06 + 0.12 * pow(along, 8.0)) * inside;
          for (int i = 0; i < 3; i++) {
            float d = length(p - uPos[i]);
            float w = 0.25 + 0.75 * uFocus[i];
            // Focal pool: neutral light, wide and soft, with a brighter core.
            c += uKey * (exp(-d * 0.0009) * 0.06 + exp(-d * 0.0032) * 0.09) * w;
            // The project's own colour, only as a fine ring around its plinth.
            c += uAccent[i] * band(d - 760.0, 3.0) * (0.12 + 0.35 * uFocus[i]);
          }
          // Faint view-dependent sheen toward the camera, like lacquer.
          float toward = 1.0 - smoothstep(0.0, 9000.0, length(p - cameraPosition.xz));
          c += vec3(0.05, 0.045, 0.09) * toward;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
  }, []);
  // Focus eases between projects in real time, so the light hands off as the camera moves.
  useFrame((_, delta) => {
    const f = frameRef.current;
    if (!f) return;
    const shot = f.segment?.destination === PROJECTS_INDEX ? f.segment.shot : -1;
    const station = shot >= 0 ? SHOT_STATION[shot] ?? -1 : -1;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 2.5);
    const focus = floor.uniforms.uFocus.value as number[];
    for (let i = 0; i < 3; i++) focus[i] += ((station < 0 ? 0.45 : station === i ? 1 : 0.12) - focus[i]) * k;
    floor.uniforms.uTime.value = f.time;
  });
  const reflector = useMemo(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(40000, 30000), floor);
    m.rotation.x = -Math.PI / 2;
    return m;
  }, [floor]);
  useEffect(() => () => { reflector.geometry.dispose(); floor.dispose(); }, [reflector, floor]);
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

const INTRO = portfolioJourney.panels.find(p => p.id === 'projects-intro')!.position;
/** Beside the Projects intro: the three projects as a floating teaser (hover lifts, click inspects). */
const TEASER: DisplaySpec[] = [
  { src: '/projects/formula-vision-replay-map.webp', position: [930, 30, -1500], width: 640, yaw: -14, aspect: 1.6, emphasis: 1, alt: 'Formula Vision screenshot' },
  { src: '/projects/aetherflow-home.webp', position: [1360, 420, -2700], width: 560, yaw: -18, aspect: 1.6, emphasis: 0.6, alt: 'AetherFlow screenshot' },
  { src: '/projects/review-bot-pipeline.webp', position: [1240, -480, -2600], width: 540, yaw: -16, aspect: 1257 / 740, emphasis: 0.5, alt: 'GitHub Review Bot screenshot' },
];

/** Soft round sprite texture (white core fading out). */
const radialTexture = (() => {
  let cache: THREE.Texture | null = null;
  return () => {
    if (cache) return cache;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    cache = new THREE.CanvasTexture(c);
    return cache;
  };
})();

/**
 * Formula Vision's installation: a holographic circuit loop behind its screens,
 * with a car of light running laps and leaving a fading trail. Decorative and
 * abstract (not a real track or real timing data).
 */
function FormulaCircuit() {
  const { curve, track, glow, car, halo, trail, trailGeometry } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wobble = 1 + 0.18 * Math.sin(a * 3 + 0.6) + 0.1 * Math.cos(a * 5);
      points.push(new THREE.Vector3(Math.cos(a) * 1500 * wobble, Math.sin(a) * 820 * wobble, 0));
    }
    const c = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    // The trail is re-sampled along the curve every frame; the lite budget uses a coarser one.
    const trailPoints = LITE ? 12 : 48;
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailPoints * 3), 3));
    const fade = new Float32Array(trailPoints);
    for (let i = 0; i < trailPoints; i++) fade[i] = i / (trailPoints - 1);
    tg.setAttribute('aFade', new THREE.BufferAttribute(fade, 1));
    return {
      curve: c,
      track: new THREE.MeshBasicMaterial({ color: '#E8002D', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      glow: new THREE.MeshBasicMaterial({ color: '#E8002D', transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      car: new THREE.MeshBasicMaterial({ color: '#FFF4F4', toneMapped: false }),
      halo: new THREE.SpriteMaterial({ map: radialTexture(), color: '#FF3355', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      trail: new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: 'attribute float aFade; varying float vFade; void main(){ vFade = aFade; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'varying float vFade; void main(){ gl_FragColor = vec4(vec3(1.0, 0.25, 0.35) * vFade, vFade); }',
      }),
      trailGeometry: tg,
    };
  }, []);
  const trailLine = useMemo(() => new THREE.Line(trailGeometry, trail), [trailGeometry, trail]);
  const carRef = useRef<THREE.Group>(null);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 360, 9, 6, true), [curve]);
  const glowTube = useMemo(() => new THREE.TubeGeometry(curve, 360, 46, 6, true), [curve]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const f = frameRef.current;
    if (!f || !carRef.current || trailLine.visible === false) return; // hidden with its world
    const lap = 11;
    // Arc-length parameter kept strictly inside [0, 1) (getPointAt rejects 1 and NaN).
    const wrap = (u: number) => (Number.isFinite(u) ? Math.min(((u % 1) + 1) % 1, 0.99999) : 0);
    const t = wrap(f.time / lap);
    curve.getPointAt(t, tmp);
    carRef.current.position.copy(tmp);
    const attr = trailGeometry.getAttribute('position') as THREE.BufferAttribute;
    const count = attr.count;
    for (let i = 0; i < count; i++) {
      curve.getPointAt(wrap(t - (1 - i / (count - 1)) * 0.09), tmp);
      attr.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    attr.needsUpdate = true;
  });

  const centre = local(EXHIBITS.fv.info, EXHIBITS.fv.yaw, [1050, -180, -3300]);
  return (
    <group position={centre} rotation={[-1.05, (EXHIBITS.fv.yaw * Math.PI) / 180, 0, 'YXZ']}>
      <mesh geometry={tube} material={track} />
      <mesh geometry={glowTube} material={glow} />
      <primitive object={trailLine} />
      <group ref={carRef}>
        <mesh material={car}><sphereGeometry args={[22, 16, 12]} /></mesh>
        <sprite material={halo} scale={[260, 260, 1]} />
      </group>
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
      <ExhibitionFloor />
      <HallLight />
      <FormulaCircuit />
      <Suspense fallback={null}>
        {/* Teasers sit beside the intro panel, outside a phone's narrow frame: skipped on the lite budget. */}
        {!LITE && <Exhibit position={INTRO} yaw={0} accent="#A78BFA" title="Projects" floorY={FLOOR_Y} displays={TEASER} focus={shot => shot === 0} bare />}
        <Exhibit position={EXHIBITS.fv.info} yaw={EXHIBITS.fv.yaw} accent={EXHIBITS.fv.accent} title="Formula Vision" floorY={FLOOR_Y} displays={FV_DISPLAYS} focus={shot => shot === 1 || shot === 2} />
        <Exhibit position={EXHIBITS.bot.info} yaw={EXHIBITS.bot.yaw} accent={EXHIBITS.bot.accent} title="GitHub Review Bot" floorY={FLOOR_Y} displays={BOT_DISPLAYS} focus={shot => shot === 3} />
        <Exhibit position={EXHIBITS.aether.info} yaw={EXHIBITS.aether.yaw} accent={EXHIBITS.aether.accent} title="AetherFlow" floorY={FLOOR_Y} displays={AETHER_DISPLAYS} focus={shot => shot === 4} />
      </Suspense>
    </group>
  );
}
