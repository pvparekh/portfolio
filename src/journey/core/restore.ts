/**
 * Scroll position to restore on back/forward. Each history entry records where the
 * visitor was; a journey page can only apply it after its first layout (until then
 * the page is not tall enough), so the value waits here.
 */
export const pendingRestore: { y: number | null } = { y: null };

/** Record the current scroll position on the current history entry. */
export function rememberScroll() {
  window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, '');
}
