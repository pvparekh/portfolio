import { useSyncExternalStore } from 'react';

/** 0 static, 1 CSS streaks (today's site), 2 WebGL lite, 3 WebGL full. */
export type Tier = 0 | 1 | 2 | 3;
export type MotionMode = 'full' | 'still';
export type SpatialPage = 'portfolio' | 'solutions' | 'software';

export interface SpatialState {
  page: SpatialPage;
  tier: Tier;
  motion: MotionMode;
  /** The scene chunk is loaded and has rendered its first frames. */
  ready: boolean;
  /** WebGL context is currently lost; the CSS fallback is shown meanwhile. */
  lost: boolean;
  /** Increments on every route change so the scene can cut instead of travel. */
  routeEpoch: number;
  /** Anchor id currently hovered or focused, used for scene highlights. */
  highlight: string | null;
}

type Listener = () => void;

function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState(patch: Partial<T>) {
      let changed = false;
      for (const key in patch) {
        if (!Object.is(state[key], patch[key])) { changed = true; break; }
      }
      if (!changed) return;
      state = { ...state, ...patch };
      listeners.forEach(listener => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}

export const spatialStore = createStore<SpatialState>({
  page: 'portfolio',
  tier: 1,
  motion: 'full',
  ready: false,
  lost: false,
  routeEpoch: 0,
  highlight: null,
});

export function useSpatial<T>(selector: (state: SpatialState) => T): T {
  return useSyncExternalStore(
    spatialStore.subscribe,
    () => selector(spatialStore.getState()),
    () => selector(spatialStore.getState()),
  );
}

/** True while the WebGL scene is visibly replacing the CSS hero decoration. */
export const isSceneActive = (state: SpatialState) => state.ready && !state.lost && state.tier >= 2;
