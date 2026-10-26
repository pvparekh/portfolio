import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getAnchors, getAnchorVersion } from '../core/anchors';
import { buildScrollMap, mapScroll, type Keyframe } from '../core/scrollMap';
import { spatialStore, type SpatialPage } from '../core/store';
import { createFilamentGeometry, createFilamentMaterial, createFloorMaterial, createHazeMaterial } from './field/filaments';
import { buildPortfolio } from './worlds/portfolio';
import { buildSolutions } from './worlds/solutions';
import { buildSoftware } from './worlds/software';
import { free, type Formation, type Station, type WorldBuilder } from './worlds/types';

const worlds: Record<SpatialPage, WorldBuilder> = {
  portfolio: buildPortfolio,
  solutions: buildSolutions,
  software: buildSoftware,
};

export interface DirectorDebug {
  s: number;
  target: number;
  station: string;
  stations: number;
  velocity: number;
  flow: number;
  camera: number[];
  quality: number;
}

interface Props {
  page: SpatialPage;
  count: number;
  still: boolean;
  test: boolean;
  quality: number;
  onFrameStats: (frameMs: number) => void;
  onReady: () => void;
}

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpColor = new THREE.Color();
const tintCache = new Map<string, THREE.Color>();
const tint = (hex: string) => {
  let color = tintCache.get(hex);
  if (!color) { color = new THREE.Color(hex); tintCache.set(hex, color); }
  return color;
};
const lerp = THREE.MathUtils.lerp;
const smoothstep = THREE.MathUtils.smoothstep;
const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export default function SceneDirector({ page, count, still, test, quality, onFrameStats, onReady }: Props) {
  const { camera, gl, invalidate } = useThree();
  const perspective = camera as THREE.PerspectiveCamera;

  const geometry = useMemo(() => createFilamentGeometry(count), [count]);
  const material = useMemo(createFilamentMaterial, []);
  const floor = useMemo(createFloorMaterial, []);
  const haze = useMemo(createHazeMaterial, []);
  const floorMesh = useRef<THREE.Mesh>(null);

  useEffect(() => () => { geometry.dispose(); }, [geometry]);
  useEffect(() => () => { material.dispose(); floor.dispose(); haze.dispose(); }, [material, floor, haze]);

  const world = useRef({
    stations: [] as Station[],
    keys: [] as Keyframe[],
    position: null as THREE.CatmullRomCurve3 | null,
    target: null as THREE.CatmullRomCurve3 | null,
    version: -1,
    viewport: 0,
    page: '' as string,
  });
  const motion = useRef({
    s: 0,
    lastScroll: window.scrollY,
    lastPosition: new THREE.Vector3(),
    velocity: 0,
    burst: 0,
    flow: 0,
    formFlow: 0,
    time: 0,
    highlight: 0,
    highlightIndex: -1,
    frames: 0,
    pointer: new THREE.Vector2(),
    parallax: new THREE.Vector2(),
  });

  // Pointer parallax (desktop): read from window since the canvas ignores pointer events.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      motion.current.pointer.set(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // In still mode the loop only runs on demand: render on scroll, layout and highlight changes.
  useEffect(() => {
    if (!still) return;
    const onChange = () => invalidate();
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    const unsubscribe = spatialStore.subscribe(onChange);
    invalidate();
    return () => {
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
      unsubscribe();
    };
  }, [still, invalidate]);

  useEffect(() => {
    const debug = (window as Window & { __spatial?: Record<string, unknown> }).__spatial ??= {};
    debug.director = (): DirectorDebug => {
      const { stations } = world.current;
      const m = motion.current;
      return {
        s: m.s,
        target: mapScroll(world.current.keys, window.scrollY + window.innerHeight / 2),
        station: stations[Math.round(m.s)]?.anchor ?? '',
        stations: stations.length,
        velocity: m.velocity,
        flow: m.flow,
        camera: perspective.position.toArray().map(v => Math.round(v * 1000) / 1000),
        quality,
      };
    };
  }, [quality, perspective]);

  function rebuild(viewport: number) {
    const w = world.current;
    const anchors = getAnchors();
    w.stations = worlds[page](anchors);
    const spans = w.stations.map(st => {
      const anchor = anchors.find(a => a.id === st.anchor);
      return { top: anchor?.top ?? 0, height: anchor?.height ?? 0 };
    });
    // Side-by-side anchors (same row) share their vertical span: split it so each still gets a dwell.
    for (let i = 1; i < spans.length; i++) {
      const prev = spans[i - 1];
      const cur = spans[i];
      if (Math.abs(cur.top - prev.top) < 40) {
        const half = Math.max(prev.height, cur.height) / 2;
        spans[i - 1] = { top: prev.top, height: half };
        spans[i] = { top: prev.top + half, height: half };
      }
    }
    w.keys = buildScrollMap(spans, viewport);
    const toVec = (v: [number, number, number]) => new THREE.Vector3(...v);
    if (w.stations.length >= 2) {
      w.position = new THREE.CatmullRomCurve3(w.stations.map(st => toVec(st.position)), false, 'centripetal');
      w.target = new THREE.CatmullRomCurve3(w.stations.map(st => toVec(st.target)), false, 'centripetal');
    } else {
      w.position = w.target = null;
    }
    w.version = getAnchorVersion();
    w.viewport = viewport;
    if (w.page !== page) {
      // Route change: cut to the new world instead of travelling, with a short streak burst.
      motion.current.s = mapScroll(w.keys, window.scrollY + viewport / 2);
      motion.current.burst = w.page ? 1 : 0;
      w.page = page;
    }
  }

  function applyFormation(form: Formation, weight: number, anchorsTop: () => ReturnType<typeof getAnchors>) {
    const u = material.uniforms;
    u.uForm.value = weight;
    u.uFormKind.value = form.kind;
    u.uFormCenter.value.set(...form.center);
    u.uFormA.value.set(...form.a);
    u.uFormB.value.set(...form.b);
    u.uFormC.value.set(...form.c);
    u.uFormShare.value = form.share;
    if (form.progressPrefix) {
      const line = window.scrollY + window.innerHeight * 0.62;
      u.uFormB.value.x = anchorsTop().filter(a => a.id.startsWith(form.progressPrefix!) && a.top < line).length;
    }
    const highlight = spatialStore.getState().highlight;
    const index = highlight && form.highlight ? form.highlight.indexOf(highlight) : -1;
    const m = motion.current;
    if (index >= 0) m.highlightIndex = form.highlight!.length === 1 ? 0 : index;
    m.highlight = index >= 0 ? 1 : (still ? 0 : m.highlight);
  }

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const m = motion.current;
    const w = world.current;
    const viewport = window.innerHeight;
    if (w.version !== getAnchorVersion() || w.viewport !== viewport || w.page !== page) rebuild(viewport);
    const { stations } = w;
    if (!stations.length) return;

    const scrollY = window.scrollY;
    const target = mapScroll(w.keys, scrollY + viewport / 2);
    const jumped = Math.abs(scrollY - m.lastScroll) > viewport * 1.5;
    m.lastScroll = scrollY;
    if (still || test || jumped) {
      if (jumped && !still) m.burst = Math.max(m.burst, 0.8);
      m.s = target;
    } else {
      m.s = damp(m.s, target, 6.5, dt);
    }
    const last = stations.length - 1;
    const s = THREE.MathUtils.clamp(m.s, 0, last);
    const i0 = Math.floor(s);
    const i1 = Math.min(i0 + 1, last);
    const f = s - i0;
    const a = stations[i0];
    const b = stations[i1];

    // Camera pose: centripetal Catmull-Rom through station poses (exact at integers).
    if (w.position && w.target) {
      w.position.getPoint(s / last, tmpA);
      w.target.getPoint(s / last, tmpB);
    } else {
      tmpA.set(...a.position);
      tmpB.set(...a.target);
    }
    const speed = dt > 0 ? tmpA.distanceTo(m.lastPosition) / dt : 0;
    m.lastPosition.copy(tmpA);
    const rawVelocity = still || test ? 0 : Math.min(speed / 160, 1.6);
    m.velocity = damp(m.velocity, rawVelocity, rawVelocity > m.velocity ? 10 : 3, dt);
    m.burst = Math.max(0, m.burst - dt * 1.6);

    if (!still && !test) m.parallax.lerp(m.pointer, 1 - Math.exp(-3 * dt));
    perspective.position.copy(tmpA);
    tmpB.x += m.parallax.x * 0.35;
    tmpB.y -= m.parallax.y * 0.22;
    perspective.lookAt(tmpB);
    const fov = lerp(a.fov, b.fov, f) + Math.min(10, (m.velocity + m.burst) * 7);
    if (Math.abs(perspective.fov - fov) > 0.01) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }

    // Time integration keeps flow continuous when its speed changes.
    const flowSpeed = lerp(a.speed, b.speed, f) * (1 + (m.velocity + m.burst) * 1.4);
    if (!still && !test) {
      m.time += dt;
      m.flow += dt * flowSpeed;
      m.formFlow += dt * lerp(a.speed, b.speed, f);
    }

    const u = material.uniforms;
    const size = state.size;
    const dpr = state.viewport.dpr;
    const bufferW = size.width * dpr;
    const bufferH = size.height * dpr;
    u.uTime.value = m.time;
    u.uFlow.value = m.flow;
    u.uFormFlow.value = m.formFlow;
    u.uTanHalfFov.value = Math.tan(THREE.MathUtils.degToRad(perspective.fov / 2));
    u.uAspect.value = size.width / size.height;
    u.uResolution.value.set(bufferW, bufferH);
    u.uPixelRatio.value = dpr;
    u.uVelocity.value = m.velocity + m.burst;
    u.uDensity.value = lerp(a.density, b.density, f) * (quality >= 1 ? 0.7 : 1);
    u.uIntensity.value = lerp(a.intensity, b.intensity, f);
    u.uFormAlpha.value = lerp(a.formAlpha, b.formAlpha, f);

    // Formation: locked through transits between stations that share it,
    // otherwise dissolve to free flow at the midpoint and re-form.
    const anchorsTop = getAnchors;
    if (a.formation.key === b.formation.key) applyFormation(a.formation, 1, anchorsTop);
    else if (f < 0.5) applyFormation(a.formation, 1 - smoothstep(f, 0, 0.5), anchorsTop);
    else applyFormation(b.formation === free ? free : b.formation, smoothstep(f, 0.5, 1), anchorsTop);
    u.uHighlight.value.set(m.highlightIndex, m.highlight * 0.9);
    if (!still) m.highlight = Math.max(0, m.highlight - dt * 2.5);

    tmpColor.copy(tint(a.tint)).lerp(tint(b.tint), f);
    u.uTint.value.copy(tmpColor);
    u.uTintMix.value = lerp(a.tintMix, b.tintMix, f);
    u.uCoreBoost.value = quality >= 3 ? 1 : 1.6;

    const scrim = lerp(a.scrim, b.scrim, f);
    // The scrim covers the shared content container (max-w-6xl / sol-container).
    const halfW = Math.min(590 * dpr, bufferW * 0.44);
    u.uScrim.value = scrim;
    u.uScrimRect.value.set(bufferW / 2, bufferH * 0.46, halfW, bufferH * 0.36);
    floor.uniforms.uScrim.value = scrim * 0.9;
    floor.uniforms.uScrimRect.value.copy(u.uScrimRect.value);

    // Floor follows the camera in whole cells so the grid never swims.
    if (floorMesh.current) {
      const cell = floor.uniforms.uCell.value as number;
      floorMesh.current.position.set(Math.round(tmpA.x / cell) * cell, 0, Math.round(tmpA.z / cell) * cell);
    }

    // Horizon haze sits at the projected vanishing point of the forward direction.
    perspective.getWorldDirection(tmpB);
    tmpB.y = 0;
    if (tmpB.lengthSq() < 1e-6) tmpB.set(0, 0, -1);
    tmpB.normalize().multiplyScalar(2000).add(perspective.position);
    tmpB.y = 0;
    tmpB.project(perspective);
    haze.uniforms.uCenter.value.set(tmpB.x, THREE.MathUtils.clamp(tmpB.y, -2, 2));
    haze.uniforms.uAspect.value = size.width / size.height;
    haze.uniforms.uStrength.value = lerp(a.haze, b.haze, f);

    onFrameStats(rawDt * 1000);
    if (++m.frames === (still || test ? 1 : 3)) onReady();
  });

  return (
    <>
      <mesh frustumCulled={false} renderOrder={-2} material={haze}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh ref={floorMesh} frustumCulled={false} renderOrder={-1} rotation-x={-Math.PI / 2} material={floor}>
        <planeGeometry args={[400, 400]} />
      </mesh>
      <mesh frustumCulled={false} geometry={geometry} material={material} />
    </>
  );
}
