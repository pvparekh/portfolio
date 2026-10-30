import { detectTier } from '../../spatial/core/capability';

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };

/**
 * Whether the visible "Standard layout" switch is offered. The option itself stays
 * (?layout=classic, setLayoutPreference); while the switch is hidden, a previously
 * saved "classic" choice is not honoured, since there would be no way back.
 */
export const SHOW_LAYOUT_SWITCH = false;

/** Desktop only for now: phones and tablets keep the standard site until mobile is tuned. */
const isDesktop = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1024;

/**
 * Whether to present the spatial journey or the standard page. The journey
 * needs a capable desktop and motion allowed. `?layout=classic|spatial` overrides.
 */
export function journeyEligible(): boolean {
  const param = new URLSearchParams(window.location.search).get('layout');
  if (param === 'classic') return false;
  if (param === 'spatial') return true;
  if (SHOW_LAYOUT_SWITCH && read('layout') === 'classic') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && read('layout') !== 'spatial') return false;
  if (!isDesktop()) return false;
  return detectTier() >= 2;
}

export function setLayoutPreference(layout: 'classic' | 'spatial') {
  try { localStorage.setItem('layout', layout); } catch { /* storage unavailable */ }
  const url = new URL(window.location.href);
  url.searchParams.delete('layout');
  window.location.replace(url.toString());
}
