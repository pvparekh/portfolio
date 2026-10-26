import type { MotionMode, Tier } from './store';

export interface CapabilityEnv {
  search: string;
  coarsePointer: boolean;
  saveData: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  webgl2: boolean;
  storedTier?: string | null;
  demoted: boolean;
  spatialEnv?: string;
}

const tierNames: Record<string, Tier> = { off: 0, css: 1, lite: 2, full: 3 };

/**
 * Pure tier decision so it can be unit-tested with any environment.
 * Desktop-first: touch devices keep today's CSS streaks until the mobile pass.
 */
export function decideTier(env: CapabilityEnv): Tier {
  if (env.spatialEnv === 'off') return 1;
  const param = new URLSearchParams(env.search).get('spatial');
  const override = param && param !== 'test' ? param : env.storedTier;
  if (override && override in tierNames) {
    const forced = tierNames[override];
    return forced >= 2 && !env.webgl2 ? 1 : forced;
  }
  if (env.demoted || !env.webgl2 || env.saveData) return 1;
  if (env.coarsePointer) return 1;
  if ((env.deviceMemory ?? 8) < 4 || (env.hardwareConcurrency ?? 8) <= 4) return 2;
  return 3;
}

function probeWebgl2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function read(storage: () => Storage, key: string): string | null {
  try { return storage().getItem(key); } catch { return null; }
}

export function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return decideTier({
    search: window.location.search,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches,
    saveData: !!nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    webgl2: probeWebgl2(),
    storedTier: read(() => localStorage, 'spatial-tier'),
    demoted: read(() => sessionStorage, 'spatial-demoted') === '1',
    spatialEnv: import.meta.env.VITE_SPATIAL,
  });
}

export function demoteForSession() {
  try { sessionStorage.setItem('spatial-demoted', '1'); } catch { /* storage unavailable */ }
}

export const isTestMode = () => new URLSearchParams(window.location.search).get('spatial') === 'test';

const reducedMotionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

/** An explicit choice from the in-page toggle wins; otherwise follow the OS setting. */
export function readMotionPreference(): MotionMode {
  const stored = read(() => localStorage, 'spatial-motion');
  if (stored === 'off') return 'still';
  if (stored === 'on') return 'full';
  return reducedMotionQuery().matches ? 'still' : 'full';
}

export function storeMotionPreference(mode: MotionMode) {
  try { localStorage.setItem('spatial-motion', mode === 'still' ? 'off' : 'on'); } catch { /* storage unavailable */ }
}

export function onReducedMotionChange(listener: () => void) {
  const query = reducedMotionQuery();
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
