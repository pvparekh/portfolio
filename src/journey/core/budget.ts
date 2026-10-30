/**
 * Rendering budget, decided once per load. Phones and tablets (a touch-first
 * pointer, or a small screen) get a lighter scene: fewer particles, no teaser
 * exhibits, a cheaper Formula Vision trail and a lower resolution cap.
 * `?budget=lite|full` overrides (testing).
 */
function decideLite(): boolean {
  const param = new URLSearchParams(window.location.search).get('budget');
  if (param === 'lite') return true;
  if (param === 'full') return false;
  const touch = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches;
  return touch || Math.min(window.innerWidth, window.innerHeight) < 600;
}

export const LITE = decideLite();

/** Particle counts on the lite budget (vertex work and fill both scale with them). */
export const particles = (count: number) => (LITE ? Math.round(count * 0.45) : count);

/** Highest render resolution (device pixels per CSS pixel); adaptive resolution steps down from here to 1. */
export const DPR_CAP = LITE ? 1.25 : 2;
