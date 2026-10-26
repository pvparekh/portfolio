/**
 * Registry of DOM elements the scene choreographs against. Registration only
 * adds a data attribute; it never wraps or moves elements. Measurements are
 * cached in document coordinates and refreshed on layout changes, so the
 * render loop never reads layout.
 */
export type AnchorMeta = Record<string, string | number | boolean>;

export interface Anchor {
  id: string;
  el: HTMLElement;
  meta: AnchorMeta;
  top: number;
  height: number;
}

const registry = new Map<string, Anchor>();
const listeners = new Set<() => void>();
let version = 0;
let frame = 0;
let observer: ResizeObserver | null = null;

function measure() {
  frame = 0;
  const scrollY = window.scrollY;
  for (const anchor of registry.values()) {
    const rect = anchor.el.getBoundingClientRect();
    anchor.top = rect.top + scrollY;
    anchor.height = rect.height;
  }
  version++;
  listeners.forEach(listener => listener());
}

export function scheduleMeasure() {
  if (!frame) frame = requestAnimationFrame(measure);
}

function ensureObservers() {
  if (observer || typeof ResizeObserver === 'undefined') return;
  observer = new ResizeObserver(scheduleMeasure);
  observer.observe(document.body);
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  // <details> disclosures change section heights without resizing the body width.
  document.addEventListener('toggle', scheduleMeasure, true);
  document.fonts?.ready.then(scheduleMeasure);
}

export function registerAnchor(id: string, el: HTMLElement, meta: AnchorMeta = {}) {
  ensureObservers();
  el.dataset.sceneAnchor = id;
  registry.set(id, { id, el, meta, top: 0, height: 0 });
  scheduleMeasure();
}

export function unregisterAnchor(id: string, el: HTMLElement) {
  if (registry.get(id)?.el === el) {
    registry.delete(id);
    scheduleMeasure();
  }
}

/** Anchors in document order. */
export function getAnchors(): Anchor[] {
  return [...registry.values()].filter(anchor => anchor.el.isConnected).sort((a, b) => a.top - b.top);
}

export const getAnchorVersion = () => version;

export function subscribeAnchors(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
