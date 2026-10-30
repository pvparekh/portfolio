import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, advance, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { JourneyEngine } from '../core/engine';
import type { Palette } from '../core/types';
import { demoteForSession } from '../../spatial/core/capability';
import { DPR_CAP } from '../core/budget';
import { frameRef } from './shared/frame';
import SkyDome from './shared/SkyDome';
import TravelStreaks from './shared/TravelStreaks';
import Warmup from './shared/Warmup';
import { Picker } from './shared/pick';
import Motes from './shared/Motes';
import AdaptiveResolution from './shared/AdaptiveResolution';

/** Keeps the three.js camera identical to the engine's (same pose, fov, aspect). */
function CameraSync({ palettes }: { palettes: Palette[] }) {
  const { camera, gl, size, scene } = useThree();
  const perspective = camera as THREE.PerspectiveCamera;
  const colors = useMemo(() => palettes.map(p => new THREE.Color(p.background)), [palettes]);
  const clear = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const [x, y, z] = frame.pose.position;
    perspective.position.set(x, y, z);
    perspective.up.set(0, 1, 0);
    perspective.lookAt(frame.pose.target[0], frame.pose.target[1], frame.pose.target[2]);
    const aspect = size.width / size.height;
    if (perspective.fov !== frame.fov || Math.abs(perspective.aspect - aspect) > 1e-4) {
      perspective.fov = frame.fov;
      perspective.aspect = aspect;
      perspective.updateProjectionMatrix();
    }
    const i = Math.min(Math.floor(frame.place), colors.length - 1);
    const f = Math.min(Math.max(frame.place - i, 0), 1);
    clear.copy(colors[Math.max(i, 0)]).lerp(colors[Math.min(i + 1, colors.length - 1)], f);
    gl.setClearColor(clear, 1);
    // One fog for the whole universe, tinted by the current destination.
    if (!scene.fog) scene.fog = new THREE.FogExp2(clear.getHex(), 0.000016);
    (scene.fog as THREE.FogExp2).color.copy(clear);
  }, -10);
  return null;
}

interface Props {
  engine: JourneyEngine;
  palettes: Palette[];
  children: ReactNode;
}

/**
 * Shared WebGL viewport for a journey page. It never runs its own loop:
 * the engine calls `advance()` once per frame after updating the camera.
 */
export default function JourneyCanvas({ engine, palettes, children }: Props) {
  const losses = useRef(0);
  const dpr = useMemo(() => Math.min(window.devicePixelRatio || 1, DPR_CAP), []);

  useEffect(() => {
    engine.setRenderer(frame => {
      frameRef.current = frame;
      advance(performance.now());
    });
    return () => {
      engine.setRenderer(null);
      document.documentElement.classList.remove('journey-gl-ready', 'journey-gl-lost');
    };
  }, [engine]);

  return (
    <Canvas
      className="journey-canvas"
      aria-hidden="true"
      frameloop="never"
      dpr={[1, dpr]}
      // The canvas is fixed to the viewport: re-measuring it on every scroll only forces layout.
      resize={{ scroll: false }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 32, near: 20, far: 900000, position: [0, 0, 1600] }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 0, pointerEvents: 'none' }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.domElement.addEventListener('webglcontextlost', event => {
          event.preventDefault();
          losses.current += 1;
          if (losses.current >= 2) demoteForSession();
          document.documentElement.classList.add('journey-gl-lost');
        });
        gl.domElement.addEventListener('webglcontextrestored', () => {
          document.documentElement.classList.remove('journey-gl-lost');
          engine.wake();
        });
        const debug = (window as Window & { __journey?: Record<string, unknown> }).__journey;
        if (debug) {
          debug.gl = () => ({ ...gl.info.render, memory: { ...gl.info.memory }, dpr: gl.getPixelRatio() });
          debug.scene = scene;
          debug.loseContext = () => gl.forceContextLoss();
          debug.restoreContext = () => gl.forceContextRestore();
        }
        document.documentElement.classList.add('journey-gl-ready');
        engine.wake();
      }}
    >
      <CameraSync palettes={palettes} />
      <SkyDome palettes={palettes} />
      <TravelStreaks />
      {children}
      <AdaptiveResolution max={dpr} />
      <Motes />
      <Picker />
      <Warmup />
    </Canvas>
  );
}
