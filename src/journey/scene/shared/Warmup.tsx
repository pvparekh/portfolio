import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Compiles every material and uploads every texture once, up front, so that
 * arriving at a new destination never stalls on shader compilation or texture
 * upload (the hitches otherwise show up as p99 frame spikes mid-journey).
 * Re-runs when lazily loaded content (exhibit textures) appears.
 */
export default function Warmup() {
  const { gl, scene, camera } = useThree();
  const done = useRef(new WeakSet<THREE.Texture>());

  useEffect(() => {
    const warm = () => {
      const hidden: THREE.Object3D[] = [];
      scene.traverse(object => {
        if (!object.visible) { hidden.push(object); object.visible = true; }
        const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        const materials = Array.isArray(material) ? material : material ? [material] : [];
        for (const m of materials) {
          for (const value of Object.values(m as unknown as Record<string, unknown>)) {
            if (value instanceof THREE.Texture && value.image && !done.current.has(value)) {
              gl.initTexture(value);
              done.current.add(value);
            }
          }
        }
      });
      gl.compile(scene, camera);
      hidden.forEach(object => { object.visible = false; });
    };
    // Once after mount, and again after async content (textures) has had time to arrive.
    const timers = [80, 1500, 4000].map(ms => window.setTimeout(warm, ms));
    return () => timers.forEach(clearTimeout);
  }, [gl, scene, camera]);

  return null;
}
