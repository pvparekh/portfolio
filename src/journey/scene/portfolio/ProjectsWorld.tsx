import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef, skyHorizon, usePresence } from '../shared/frame';
import { EXHIBITS, PROJECTS, local } from '../../worlds/portfolio';
import Exhibit, { type DisplaySpec } from './Exhibit';
import { LITE } from '../../core/budget';
import { VOID_LANE_ITEMS, VOID_LANE_MEDIA, VL_ASPECT, displaySrc } from '../../../projects/voidLane';


const FLOOR_Y = PROJECTS[1] - 1500;

// Displays sit to the right of each info panel, angled toward the reading camera.
// Void Lane's three are the first gallery captures; clicking any opens the whole gallery.
const VL_LAYOUT: { position: [number, number, number]; width: number; yaw: number; emphasis: number }[] = [
  { position: [860, 60, -700], width: 860, yaw: -22, emphasis: 1 },
  { position: [1240, 640, -1800], width: 640, yaw: -26, emphasis: 0.5 },
  { position: [600, -470, -2000], width: 600, yaw: -16, emphasis: 0.36 },
];
const VL_DISPLAYS: DisplaySpec[] = VL_LAYOUT.slice(0, LITE ? 2 : 3).map((d, i) => ({
  ...d, aspect: VL_ASPECT, src: displaySrc(VOID_LANE_MEDIA[i]), alt: VOID_LANE_MEDIA[i].alt,
}));
// The throat clip loops in the mouth of the ring installation while the visitor is
// here (a light 960x540 encode, fetched on arrival); a click opens the full clip.
const VL_CLIP = VOID_LANE_MEDIA.findIndex(m => m.stem === 'clip-throat');
if (!LITE && VL_CLIP >= 0) {
  VL_DISPLAYS.push({
    position: [1760, -280, -2250], width: 760, yaw: -32, emphasis: 0.9, aspect: VL_ASPECT,
    src: displaySrc(VOID_LANE_MEDIA[VL_CLIP]), alt: VOID_LANE_MEDIA[VL_CLIP].alt,
    video: '/projects/void-lane/clip-throat-loop.webm', galleryIndex: VL_CLIP,
  });
}
const FV_DISPLAYS: DisplaySpec[] = [
  { src: '/projects/formula-vision-archive.webp', position: [820, 40, -700], width: 780, yaw: -22, aspect: 1.6, emphasis: 1 },
  { src: '/projects/formula-vision-replay-map.webp', position: [1180, 560, -1750], width: 620, yaw: -26, aspect: 1.6, emphasis: 0.5 },
  { src: '/projects/formula-vision-chase-camera.webp', position: [560, -500, -1950], width: 560, yaw: -16, aspect: 1.6, emphasis: 0.36 },
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
const ORDER = [EXHIBITS.vl, EXHIBITS.fv, EXHIBITS.bot, EXHIBITS.aether];
const STATIONS = ORDER.map((e, i) => local(e.info, e.yaw, i === 0 ? [860, 0, -700] : [820, 0, -700]));

/**
 * The exhibition floor, designed as one installation (museum lighting hierarchy):
 * - general light: a single platform whose engraved border and walkway line join
 *   all four projects, so on approach the section reads as one designed group;
 * - focal light: a neutral pool under each project, always on at one steady dim
 *   level (nothing changes with scroll, so nothing can flicker);
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
        uAccent: { value: ORDER.map(e => new THREE.Color(e.accent)) },
        uCentre: { value: centre },
        uRadii: { value: new THREE.Vector2(16400, 7200) },
        uTime: { value: 0 },
      },
      vertexShader: 'varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform vec3 uBase; uniform vec3 uKey; uniform vec2 uPos[4]; uniform vec3 uAccent[4];
        uniform vec2 uCentre; uniform vec2 uRadii; uniform float uTime; varying vec3 vWorld;
        float band(float d, float w) { return 1.0 - smoothstep(w, w + fwidth(d) * 1.5, abs(d)); }
        float segment(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
        void main() {
          vec2 p = vWorld.xz;
          vec3 c = uBase;
          // The platform: polished, slightly lighter stone inside an engraved double border.
          float e = length((p - uCentre) / uRadii);
          float inside = 1.0 - smoothstep(0.97, 1.0, e);
          c += uKey * 0.024 * inside;
          // Ambient wash: a broad, soft light over the whole platform, brightest at its heart.
          // Anchored to the floor (never to the camera), so it holds steady at any scroll speed.
          c += uKey * 0.036 * exp(-e * e * 2.2) * inside;
          c += uKey * (band(e - 1.0, 0.0016) * 0.22 + band(e - 0.955, 0.0009) * 0.08);
          // The walkway: one fine line joining the projects in reading order, a soft light travelling it.
          float route = min(min(segment(p, uPos[0], uPos[1]), segment(p, uPos[1], uPos[2])), segment(p, uPos[2], uPos[3]));
          float along = fract(dot(p - uPos[0], normalize(uPos[3] - uPos[0])) / 2400.0 - uTime * 0.05);
          c += uKey * band(route, 5.0) * (0.06 + 0.12 * pow(along, 8.0)) * inside;
          for (int i = 0; i < 4; i++) {
            float d = length(p - uPos[i]);
            // Always on: every pool burns at one steady, dim level wherever the camera is
            // and whatever is being read, so no frame of a scroll can catch it changing.
            c += uKey * (exp(-d * 0.0009) * 0.06 + exp(-d * 0.0032) * 0.09) * 0.8;
            // The project's own colour, only as a fine ring around its plinth.
            c += uAccent[i] * band(d - 760.0, 3.0) * 0.3;
          }
          // Lacquer sheen, fixed to the platform rather than following the camera.
          c += vec3(0.05, 0.045, 0.09) * 0.45 * (1.0 - smoothstep(0.2, 1.0, e));
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
  }, []);
  // Only ambient time moves the floor (the soft light travelling the walkway); nothing
  // here depends on scroll position, camera or which project is being read.
  useFrame(() => {
    const f = frameRef.current;
    if (f) floor.uniforms.uTime.value = f.time;
  });
  const reflector = useMemo(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(40000, 30000), floor);
    m.rotation.x = -Math.PI / 2;
    return m;
  }, [floor]);
  useEffect(() => () => { reflector.geometry.dispose(); floor.dispose(); }, [reflector, floor]);
  // The platform always shows in full; beyond its border the floor melts into the hall's
  // haze (no hard horizon). Both fades are fixed in the world: an earlier camera-relative
  // fade made the platform appear and vanish as the camera moved (read as flicker).
  const veil = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // Far colour is the sky's own horizon colour, read each frame, through the same tone mapping:
    // the haze meets the sky without a seam, also while the backdrop cross-fades between worlds.
    uniforms: {
      uNear: { value: new THREE.Color('#06040C') },
      uFar: { value: skyHorizon },
      uCentre: floor.uniforms.uCentre,
      uRadii: floor.uniforms.uRadii,
    },
    vertexShader: 'varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 uNear; uniform vec3 uFar; uniform vec2 uCentre; uniform vec2 uRadii; varying vec3 vWorld;
      void main() {
        float e = length((vWorld.xz - uCentre) / uRadii);
        float out_ = smoothstep(1.0, 1.2, e);
        // Very far floor joins the horizon whatever the platform does (changes slowly with distance).
        float far = smoothstep(18000.0, 60000.0, length(vWorld.xz - cameraPosition.xz));
        float a = max(out_, far);
        // Beyond the rim the floor glows with the horizon haze (always on, never black); only a
        // thin shadow line remains at the edge of the platform.
        gl_FragColor = vec4(mix(uNear, uFar, max(far, smoothstep(1.0, 1.12, e))), a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), [floor]);
  return (
    <group position={[PROJECTS[0], FLOOR_Y, PROJECTS[2] - 8000]}>
      <primitive object={reflector} />
      <mesh material={veil} rotation={[-Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
        <planeGeometry args={[700000, 700000]} />
      </mesh>
    </group>
  );
}

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

/**
 * Void Lane's installation: the throat, a tunnel of light rings receding into
 * the hall, with a craft of light diving through it on a loop and a streak
 * behind it. One instanced draw for the rings; decorative, not game footage.
 */
const THROAT_RINGS = 11;
const throatPath = (u: number, out: THREE.Vector3) => {
  const t = u * 1.25 - 0.15;
  return out.set(Math.sin(t * 2.4) * 160, Math.cos(t * 1.7) * 90 - 120, -t * 5200);
};
function VoidThroat() {
  const { rings, ringMaterial, craft, halo, streak, streakGeometry } = useMemo(() => {
    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const rings = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.012, 6, 96), ringMaterial, THROAT_RINGS);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const cyan = new THREE.Color('#1FE3FF');
    const amber = new THREE.Color('#FFB21E');
    for (let i = 0; i < THROAT_RINGS; i++) {
      const t = i / (THROAT_RINGS - 1);
      const r = 900 - t * 420;
      m.compose(new THREE.Vector3(Math.sin(t * 2.4) * 160, Math.cos(t * 1.7) * 90, -t * 5200), q, new THREE.Vector3(r, r * 0.92, r));
      rings.setMatrixAt(i, m);
      // Fade with depth; every fourth ring carries the game's boost amber.
      rings.setColorAt(i, (i % 4 === 2 ? amber : cyan).clone().multiplyScalar(0.85 - t * 0.6));
    }
    rings.instanceMatrix.needsUpdate = true;
    rings.frustumCulled = false;
    const points = LITE ? 8 : 20;
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points * 3), 3));
    const fade = new Float32Array(points);
    for (let i = 0; i < points; i++) fade[i] = i / (points - 1);
    sg.setAttribute('aFade', new THREE.BufferAttribute(fade, 1));
    return {
      rings, ringMaterial,
      craft: new THREE.MeshBasicMaterial({ color: '#EAF2FF', toneMapped: false }),
      halo: new THREE.SpriteMaterial({ map: radialTexture(), color: '#1FE3FF', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      streak: new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: 'attribute float aFade; varying float vFade; void main(){ vFade = aFade; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'varying float vFade; void main(){ gl_FragColor = vec4(vec3(0.12, 0.89, 1.0) * vFade, vFade); }',
      }),
      streakGeometry: sg,
    };
  }, []);
  const streakLine = useMemo(() => new THREE.Line(streakGeometry, streak), [streakGeometry, streak]);
  const craftRef = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => { rings.geometry.dispose(); rings.dispose(); ringMaterial.dispose(); streakGeometry.dispose(); streak.dispose(); }, [rings, ringMaterial, streakGeometry, streak]);

  useFrame(() => {
    const f = frameRef.current;
    if (!f || !craftRef.current || streakLine.visible === false) return; // hidden with its world
    const u = (f.time / 3.2) % 1;
    craftRef.current.position.copy(throatPath(u, tmp));
    const attr = streakGeometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < attr.count; i++) {
      throatPath(Math.max(0, u - (1 - i / (attr.count - 1)) * 0.16), tmp);
      attr.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    attr.needsUpdate = true;
  });

  const mouth = local(EXHIBITS.vl.info, EXHIBITS.vl.yaw, [1150, 140, -3200]);
  return (
    <group position={mouth} rotation={[0.08, (EXHIBITS.vl.yaw * Math.PI) / 180 + 0.62, 0, 'YXZ']}>
      <primitive object={rings} />
      <primitive object={streakLine} />
      <group ref={craftRef}>
        <mesh material={craft}><sphereGeometry args={[18, 12, 10]} /></mesh>
        <sprite material={halo} scale={[240, 240, 1]} />
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
      <VoidThroat />
      <Suspense fallback={null}>
        {/* Teasers sit beside the intro panel, outside a phone's narrow frame: skipped on the lite budget. */}
        <Exhibit position={EXHIBITS.vl.info} yaw={EXHIBITS.vl.yaw} accent={EXHIBITS.vl.accent} title="Void Lane" floorY={FLOOR_Y} displays={VL_DISPLAYS} gallery={VOID_LANE_ITEMS} focus={shot => shot === 1 || shot === 2} />
        <Exhibit position={EXHIBITS.fv.info} yaw={EXHIBITS.fv.yaw} accent={EXHIBITS.fv.accent} title="Formula Vision" floorY={FLOOR_Y} displays={FV_DISPLAYS} focus={shot => shot === 3 || shot === 4} />
        <Exhibit position={EXHIBITS.bot.info} yaw={EXHIBITS.bot.yaw} accent={EXHIBITS.bot.accent} title="GitHub Review Bot" floorY={FLOOR_Y} displays={BOT_DISPLAYS} focus={shot => shot === 5} />
        <Exhibit position={EXHIBITS.aether.info} yaw={EXHIBITS.aether.yaw} accent={EXHIBITS.aether.accent} title="AetherFlow" floorY={FLOOR_Y} displays={AETHER_DISPLAYS} focus={shot => shot === 6} />
      </Suspense>
    </group>
  );
}
