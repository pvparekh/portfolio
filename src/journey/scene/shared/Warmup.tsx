import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef, worlds } from './frame';

/**
 * Pays first-use costs up front without ever blocking a frame:
 * - shaders for every world (and for each reflector-style render target) are
 *   compiled with `compileAsync`, which uses KHR_parallel_shader_compile where
 *   available so linking happens off the main thread;
 * - textures are uploaded one per frame instead of all at once.
 * An earlier version drew the whole universe in one frame to force drivers to
 * finish shader work; that cost 0.7-1 s freezes after load, so it is gone.
 */
export default function Warmup() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;
    const uploaded = new WeakSet<THREE.Texture>();

    // Draw these parts once, clipped to a single pixel: the driver finishes its shader work
    // (ANGLE/D3D completes programs, and instanced input layouts, only at a first real draw).
    const drawn = new Set<THREE.Object3D>();
    const drawOnce = (batch: THREE.Object3D[]) => {
      const changed: [THREE.Object3D, boolean, boolean][] = [];
      for (const part of batch) {
        drawn.add(part);
        // The part and its ancestors must be visible for it to draw.
        for (let o: THREE.Object3D | null = part; o; o = o.parent) {
          changed.push([o, o.visible, o.frustumCulled]);
          o.visible = true;
        }
        part.frustumCulled = false;
      }
      const scissor = gl.getScissorTest();
      gl.setScissorTest(true);
      gl.setScissor(0, 0, 1, 1);
      gl.render(scene, camera);
      gl.setScissorTest(scissor);
      gl.setScissor(0, 0, gl.domElement.width, gl.domElement.height);
      for (let i = changed.length - 1; i >= 0; i--) { const [o, v, f] = changed[i]; o.visible = v; o.frustumCulled = f; }
    };

    let firstWarm = true;
    const warm = async () => {
      if (cancelled) return;
      const hidden: THREE.Object3D[] = [];
      const textures: THREE.Texture[] = [];
      const targets = new Set<THREE.WebGLRenderTarget>();
      scene.traverse(object => {
        if (!object.visible) { hidden.push(object); object.visible = true; }
        const reflector = object as THREE.Object3D & { getRenderTarget?: () => THREE.WebGLRenderTarget };
        if (reflector.getRenderTarget) targets.add(reflector.getRenderTarget());
        const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        for (const m of Array.isArray(material) ? material : material ? [material] : []) {
          for (const value of Object.values(m as unknown as Record<string, unknown>)) {
            if (value instanceof THREE.Texture && value.image && !uploaded.has(value)) textures.push(value);
          }
        }
      });
      const pending: Promise<unknown>[] = [gl.compileAsync(scene, camera)];
      const previous = gl.getRenderTarget();
      for (const target of targets) {
        gl.setRenderTarget(target);
        pending.push(gl.compileAsync(scene, camera));
      }
      gl.setRenderTarget(previous);
      hidden.forEach(object => { object.visible = false; });
      await Promise.all(pending).catch(() => {});
      // Instanced meshes cost the most at first draw (about 180 ms for the Experience
      // colonnade): pay it now, while the page is still settling after load, rather than
      // in an idle slot later where it reads as a freeze.
      if (firstWarm && !cancelled) {
        firstWarm = false;
        const instanced: THREE.Object3D[] = [];
        for (const [world] of worlds) world.traverse(o => { if ((o as THREE.InstancedMesh).isInstancedMesh && !drawn.has(o)) instanced.push(o); });
        if (instanced.length) drawOnce(instanced);
      }
      // One texture per animation frame keeps every upload inside a frame budget.
      for (const texture of textures) {
        if (cancelled) return;
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (!uploaded.has(texture)) { gl.initTexture(texture); uploaded.add(texture); }
      }
    };
    // While the visitor is idle, first-draw each remaining part, nearest world first,
    // one part per idle slot.
    const warmNextWorld = (deadline?: IdleDeadline) => {
      if (cancelled) return;
      if (deadline && deadline.timeRemaining() < 12 && !deadline.didTimeout) { schedule(); return; }
      const place = frameRef.current?.place ?? 0;
      // Work in small pieces (each drawable part of a world separately) so no single idle
      // slot carries a whole world's driver work.
      const parts: [THREE.Object3D, number][] = [];
      for (const [world, index] of worlds) {
        world.traverse(o => {
          const drawable = (o as THREE.Mesh).isMesh || (o as THREE.Points).isPoints || (o as THREE.Line).isLine;
          if (drawable && !drawn.has(o)) parts.push([o, index]);
        });
      }
      if (!parts.length) return;
      parts.sort((a, b) => Math.abs(a[1] - place) - Math.abs(b[1] - place));
      const batch = parts.slice(0, 1).map(([o]) => o);
      drawOnce(batch);
      schedule();
    };
    let idleId = 0;
    const schedule = () => {
      idleId = window.requestIdleCallback
        ? window.requestIdleCallback(warmNextWorld, { timeout: 1500 })
        : window.setTimeout(() => warmNextWorld(), 200);
    };
    // Once after mount, and again after lazily loaded textures have arrived.
    const timers = [120, 2500].map(ms => window.setTimeout(() => { void warm(); }, ms));
    const worldTimer = window.setTimeout(schedule, 700);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearTimeout(worldTimer);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId); else clearTimeout(idleId);
    };
  }, [gl, scene, camera]);

  return null;
}
