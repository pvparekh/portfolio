import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Object3D } from 'three';
import type { JourneyFrame } from '../../core/engine';

/** The current journey frame, written by the engine right before each render. */
export const frameRef: { current: JourneyFrame | null } = { current: null };

/**
 * Show an environment only near its destination (by continuous place index),
 * so far-away worlds cost nothing to render. Returns a ref for the group and
 * the current presence (0..1) via callback.
 */
export function usePresence(index: number, onPresence?: (presence: number, frame: JourneyFrame) => void, range = 1.15) {
  const ref = useRef<Object3D>(null);
  useFrame(() => {
    const frame = frameRef.current;
    if (!frame || !ref.current) return;
    const distance = Math.abs(frame.place - index);
    const visible = distance < range;
    ref.current.visible = visible;
    if (visible) onPresence?.(Math.max(0, 1 - distance), frame);
  });
  return ref;
}
