import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef } from './frame';

/**
 * Pointer picking for 3D exhibits. The HTML layer sits above WebGL, so R3F's
 * own events never fire; instead one raycast per frame runs against registered
 * meshes, using the engine's pointer, and yields whenever the mouse is over
 * real content (text, links, chrome).
 */
export interface Pickable {
  mesh: THREE.Object3D;
  onHover: (hovered: boolean) => void;
  onSelect: () => void;
}

const pickables = new Set<Pickable>();
let hovered: Pickable | null = null;

export function registerPickable(p: Pickable) {
  pickables.add(p);
  return () => {
    pickables.delete(p);
    if (hovered === p) setHovered(null);
  };
}

function setHovered(next: Pickable | null) {
  if (hovered === next) return;
  hovered?.onHover(false);
  hovered = next;
  next?.onHover(true);
  document.documentElement.classList.toggle('journey-pick', !!next);
}

const shown = (object: THREE.Object3D) => {
  for (let o: THREE.Object3D | null = object; o; o = o.parent) if (!o.visible) return false;
  return true;
};

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

export function Picker() {
  const { camera } = useThree();

  useFrame(() => {
    const frame = frameRef.current;
    if (!frame || !frame.pointerRaw || frame.pointerOnContent || frame.travel > 0.2) { setHovered(null); return; }
    ndc.set(frame.pointerRaw[0], -frame.pointerRaw[1]);
    raycaster.setFromCamera(ndc, camera);
    let best: { p: Pickable; d: number } | null = null;
    for (const p of pickables) {
      if (!shown(p.mesh)) continue;
      const hit = raycaster.intersectObject(p.mesh, false)[0];
      if (hit && (!best || hit.distance < best.d)) best = { p, d: hit.distance };
    }
    setHovered(best?.p ?? null);
  });

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!hovered || event.button !== 0) return;
      const target = event.target as Element | null;
      if (target?.closest('.journey-panel > *, [data-journey-ui], nav, a, button, .journey-inspect')) return;
      hovered.onSelect();
    };
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
      setHovered(null);
    };
  }, []);

  return null;
}

/** Ask the page to show images full size (handled by the DOM overlay in JourneyStage). */
export function openInspect(images: { src: string; alt: string }[], index: number) {
  window.dispatchEvent(new CustomEvent('journey-inspect', { detail: { images, index } }));
}
