import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef } from './frame';

/**
 * Pointer picking for 3D exhibits. The HTML layer sits above WebGL, so R3F's
 * own events never fire; instead one raycast per frame runs against registered
 * meshes, using the engine's pointer, and yields whenever the mouse is over
 * real content (text, links, chrome). Touch has no hover, so a tap picks at
 * the tapped point instead.
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

/** The nearest shown pickable under a point in normalized device coordinates (y up). */
function pickAt(x: number, y: number, camera: THREE.Camera) {
  ndc.set(x, y);
  raycaster.setFromCamera(ndc, camera);
  let best: { p: Pickable; d: number } | null = null;
  for (const p of pickables) {
    if (!shown(p.mesh)) continue;
    const hit = raycaster.intersectObject(p.mesh, false)[0];
    if (hit && (!best || hit.distance < best.d)) best = { p, d: hit.distance };
  }
  return best?.p ?? null;
}

const CONTENT = '.journey-panel > *, [data-journey-ui], nav, a, button, .journey-inspect';

export function Picker() {
  const { camera } = useThree();

  useFrame(() => {
    const frame = frameRef.current;
    if (!frame || !frame.pointerRaw || frame.pointerOnContent || frame.travel > 0.2) { setHovered(null); return; }
    setHovered(pickAt(frame.pointerRaw[0], -frame.pointerRaw[1], camera));
  });

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      if (target?.closest(CONTENT)) return;
      // Touch and pen have no hover: pick at the tap itself, while the camera is at rest.
      const touch = (event as PointerEvent).pointerType && (event as PointerEvent).pointerType !== 'mouse';
      const frame = frameRef.current;
      const picked = hovered ?? (touch && frame && frame.travel <= 0.2
        ? pickAt(event.clientX / window.innerWidth * 2 - 1, 1 - event.clientY / window.innerHeight * 2, camera)
        : null);
      picked?.onSelect();
    };
    window.addEventListener('click', onClick);
    // Test hook: a viewport point over a shown screen that is not covered by HTML content.
    const debug = (window as Window & { __journey?: Record<string, unknown> }).__journey;
    if (debug) debug.pickAt = () => {
      for (let y = 0.1; y < 0.95; y += 0.04) for (let x = 0.04; x < 0.98; x += 0.04) {
        const px = Math.round(x * window.innerWidth), py = Math.round(y * window.innerHeight);
        if (document.elementFromPoint(px, py)?.closest(CONTENT)) continue;
        if (pickAt(x * 2 - 1, 1 - y * 2, camera)) return [px, py];
      }
      return null;
    };
    return () => {
      window.removeEventListener('click', onClick);
      setHovered(null);
    };
  }, [camera]);

  return null;
}

/** Ask the page to show images full size (handled by the DOM overlay in JourneyStage). */
export function openInspect(images: { src: string; alt: string }[], index: number) {
  window.dispatchEvent(new CustomEvent('journey-inspect', { detail: { images, index } }));
}
