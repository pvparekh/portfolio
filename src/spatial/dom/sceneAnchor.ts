import { registerAnchor, unregisterAnchor, type AnchorMeta } from '../core/anchors';

type RefCallback = (el: HTMLElement | null) => void;
const callbacks = new Map<string, RefCallback>();

/**
 * Ref callback that registers an existing element as a scene anchor.
 * Stable per id, so React does not re-run it on every render.
 */
export function sceneAnchor(id: string, meta?: AnchorMeta): RefCallback {
  const key = meta ? id + JSON.stringify(meta) : id;
  let callback = callbacks.get(key);
  if (!callback) {
    let current: HTMLElement | null = null;
    callback = el => {
      if (el) {
        current = el;
        registerAnchor(id, el, meta);
      } else if (current) {
        unregisterAnchor(id, current);
        current = null;
      }
    };
    callbacks.set(key, callback);
  }
  return callback;
}
