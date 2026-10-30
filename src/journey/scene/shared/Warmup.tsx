import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Pays every first-use cost up front, so arriving at a new destination never
 * stalls: textures are uploaded, and the whole scene (every world, culling off)
 * is drawn once to the canvas and once into each reflector's target. Drawing,
 * not just compiling, matters: drivers such as ANGLE/D3D finish shader work
 * at first draw. The normal frame is drawn straight after, so nothing shows.
 * Re-runs when lazily loaded content (exhibit textures) appears.
 */
export default function Warmup() {
  const { gl, scene, camera } = useThree();
  const done = useRef(new WeakSet<THREE.Texture>());

  useEffect(() => {
    const warm = () => {
      const hidden: THREE.Object3D[] = [];
      const culled: THREE.Object3D[] = [];
      const targets = new Set<THREE.WebGLRenderTarget>();
      scene.traverse(object => {
        if (!object.visible) { hidden.push(object); object.visible = true; }
        if (object.frustumCulled) { culled.push(object); object.frustumCulled = false; }
        const reflector = object as THREE.Object3D & { getRenderTarget?: () => THREE.WebGLRenderTarget };
        if (reflector.getRenderTarget) targets.add(reflector.getRenderTarget());
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
      const previous = gl.getRenderTarget();
      for (const target of targets) {
        gl.setRenderTarget(target);
        gl.render(scene, camera);
      }
      gl.setRenderTarget(previous);
      gl.render(scene, camera);
      hidden.forEach(object => { object.visible = false; });
      culled.forEach(object => { object.frustumCulled = true; });
      gl.render(scene, camera);
    };
    // Once after mount, and again after async content (textures) has had time to arrive.
    const timers = [80, 1500, 4000].map(ms => window.setTimeout(warm, ms));
    return () => timers.forEach(clearTimeout);
  }, [gl, scene, camera]);

  return null;
}
