/**
 * Viewport height that ignores mobile browser chrome. When the address bar
 * collapses or expands, innerHeight changes by ~10-15% without any layout
 * change worth re-choreographing; reacting to it would make the camera jump.
 * Width changes (rotation) and large height changes still update it.
 */
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
let stableHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

export function nextStableHeight(previous: number, previousWidth: number, width: number, height: number, touch: boolean) {
  if (!touch || width !== previousWidth || Math.abs(height - previous) > previous * 0.25) return height;
  return previous;
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    stableHeight = nextStableHeight(stableHeight, lastWidth, window.innerWidth, window.innerHeight, coarse);
    lastWidth = window.innerWidth;
  }, { passive: true });
}

export const getStableViewportHeight = () => stableHeight;
