import { detectTier } from '../../spatial/core/capability';

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };

/**
 * Whether to present the spatial journey or the standard page. The journey
 * needs a capable device and motion allowed; anyone can opt out (persisted).
 */
export function journeyEligible(): boolean {
  const param = new URLSearchParams(window.location.search).get('layout');
  if (param === 'classic') return false;
  if (param === 'spatial') return true;
  if (read('layout') === 'classic') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && read('layout') !== 'spatial') return false;
  return detectTier() >= 2;
}

export function setLayoutPreference(layout: 'classic' | 'spatial') {
  try { localStorage.setItem('layout', layout); } catch { /* storage unavailable */ }
  const url = new URL(window.location.href);
  url.searchParams.delete('layout');
  window.location.replace(url.toString());
}
