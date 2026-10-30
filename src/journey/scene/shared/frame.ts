import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Light, Object3D } from 'three';
import type { JourneyFrame } from '../../core/engine';

/** The current journey frame, written by the engine right before each render. */
export const frameRef: { current: JourneyFrame | null } = { current: null };

/** Every world's root group with its destination index (used to warm worlds ahead of arrival). */
export const worlds = new Map<Object3D, number>();

/**
 * Show an environment only near its destination (by continuous place index),
 * so far-away worlds cost nothing to render. Returns a ref for the group and
 * the current presence (0..1) via callback.
 */
export function usePresence(index: number, onPresence?: (presence: number, frame: JourneyFrame) => void, range = 1.15) {
  const ref = useRef<Object3D>(null);
  const shown = useRef<boolean | null>(null);
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    worlds.set(group, index);
    return () => { worlds.delete(group); };
  }, [index]);
  const tick = useRef(0);
  useFrame(() => {
    const frame = frameRef.current;
    if (!frame || !ref.current) return;
    const distance = Math.abs(frame.place - index);
    const visible = distance < range;
    // Re-apply periodically while hidden: content that mounts later (lazy textures) must hide too.
    if (visible !== shown.current || (!visible && ++tick.current % 30 === 0)) {
      shown.current = visible;
      setPresent(ref.current, visible);
    }
    if (visible) onPresence?.(Math.max(0, 1 - distance), frame);
  });
  return ref;
}

/**
 * Hide a world's drawables but keep its lights in the scene at zero intensity.
 * Removing a light changes the scene's light count, which forces three.js to
 * recompile every lit material: the main source of mid-journey frame spikes.
 */
function setPresent(root: Object3D, visible: boolean) {
  root.traverse(object => {
    if (object === root) return;
    const light = object as Light;
    if (light.isLight) {
      if (light.userData.intensity === undefined) light.userData.intensity = light.intensity;
      light.intensity = visible ? light.userData.intensity : 0;
    } else if ((object as { isMesh?: boolean; isLine?: boolean; isPoints?: boolean; isSprite?: boolean }).isMesh
      || (object as { isLine?: boolean }).isLine || (object as { isPoints?: boolean }).isPoints) {
      object.visible = visible;
    }
  });
}
