import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { demoteForSession, isTestMode } from '../core/capability';
import { spatialStore, useSpatial } from '../core/store';
import SceneDirector from './SceneDirector';

const Effects = lazy(() => import('./Effects'));

/**
 * Quality levels, stepped down when frames run long (GitHub-globe style):
 * 0 full, 1 fewer filaments, 2 DPR 1, 3 no bloom.
 */
const MAX_QUALITY_LEVEL = 3;

export default function SpatialCanvas() {
  const page = useSpatial(state => state.page);
  const tier = useSpatial(state => state.tier);
  const motion = useSpatial(state => state.motion);
  const test = isTestMode();
  const still = motion === 'still' || test;
  const [quality, setQuality] = useState(tier === 3 ? 0 : 2);
  const losses = useRef<number[]>([]);
  const frames = useRef<number[]>([]);
  const windowStart = useRef(performance.now());

  const maxDpr = quality >= 2 ? 1 : Math.min(window.devicePixelRatio || 1, tier === 3 ? 2 : 1.5);
  const count = tier === 3 ? 5200 : 2600;

  const onFrameStats = useCallback((ms: number) => {
    if (still || document.hidden) return;
    const now = performance.now();
    frames.current.push(ms);
    if (now - windowStart.current < 2500) return;
    const samples = frames.current.slice(5).sort((a, b) => a - b);
    frames.current = [];
    windowStart.current = now;
    if (samples.length < 30) return;
    const p90 = samples[Math.floor(samples.length * 0.9)];
    if (p90 > 21) setQuality(level => Math.min(MAX_QUALITY_LEVEL, level + 1));
  }, [still]);

  const onReady = useCallback(() => spatialStore.setState({ ready: true }), []);

  useEffect(() => () => spatialStore.setState({ ready: false }), []);

  return (
    <Canvas
      className="spatial-canvas"
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}
      dpr={[1, maxDpr]}
      frameloop={still ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.1, far: 1200, position: [0, 1.7, 9] }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#08080D'), 1);
        const canvas = gl.domElement;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.addEventListener('webglcontextlost', event => {
          event.preventDefault();
          const now = performance.now();
          losses.current = [...losses.current.filter(t => now - t < 60_000), now];
          if (losses.current.length >= 2) demoteForSession();
          spatialStore.setState({ lost: true });
        });
        canvas.addEventListener('webglcontextrestored', () => {
          if (losses.current.length >= 2) {
            spatialStore.setState({ tier: 1, ready: false, lost: false });
          } else {
            spatialStore.setState({ lost: false });
          }
        });
        const debug = (window as Window & { __spatial?: Record<string, unknown> }).__spatial ??= {};
        debug.loseContext = () => gl.forceContextLoss();
        debug.restoreContext = () => gl.forceContextRestore();
        debug.info = () => ({ ...gl.info.render, memory: { ...gl.info.memory }, quality });
      }}
    >
      <SceneDirector
        page={page}
        count={count}
        still={still}
        test={test}
        quality={quality}
        onFrameStats={onFrameStats}
        onReady={onReady}
      />
      {tier === 3 && quality < 3 && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
    </Canvas>
  );
}
