import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { demoteForSession, detectTier, isTestMode, onReducedMotionChange, readMotionPreference } from '../core/capability';
import { isSceneActive, spatialStore, useSpatial, type SpatialPage } from '../core/store';

const SpatialCanvas = lazy(() => import('../scene/SpatialCanvas'));
const SpatialDebugHud = lazy(() => import('./SpatialDebugHud'));
const debugRequested = () => new URLSearchParams(window.location.search).has('spatial-debug');

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) {
    console.warn('[spatial] scene disabled after an error; showing the standard site.', error);
    demoteForSession();
    spatialStore.setState({ tier: 1, ready: false });
  }
  render() { return this.state.failed ? null : this.props.children; }
}

const whenIdle = (callback: () => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 300);
  return () => clearTimeout(id);
};

/**
 * Eager, three.js-free entry point. Decides the tier, mirrors scene state onto
 * <html> classes for CSS, wires hover/focus highlights, and lazy-loads the
 * WebGL scene after first paint. Any failure leaves the standard site in place.
 */
export default function SpatialMount({ page }: { page: SpatialPage }) {
  const tier = useSpatial(state => state.tier);
  const [load, setLoad] = useState(false);
  const firstPage = useRef(true);

  useEffect(() => {
    const { routeEpoch } = spatialStore.getState();
    spatialStore.setState({ page, routeEpoch: firstPage.current ? routeEpoch : routeEpoch + 1, highlight: null });
    firstPage.current = false;
  }, [page]);

  useEffect(() => {
    const motion = () => (isTestMode() ? 'still' : readMotionPreference());
    spatialStore.setState({ tier: detectTier(), motion: motion() });
    return onReducedMotionChange(() => spatialStore.setState({ motion: motion() }));
  }, []);

  useEffect(() => {
    if (tier < 2) return;
    return whenIdle(() => setLoad(true));
  }, [tier]);

  // Mirror state onto <html> so CSS can hand decoration over to the canvas.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const state = spatialStore.getState();
      root.classList.toggle('spatial-ready', isSceneActive(state));
      root.classList.toggle('spatial-still', state.motion === 'still');
    };
    sync();
    return spatialStore.subscribe(sync);
  }, []);

  // Hover and keyboard focus on registered anchors highlight their structure.
  useEffect(() => {
    const anchorOf = (target: EventTarget | null) =>
      (target instanceof Element ? target.closest<HTMLElement>('[data-scene-anchor]')?.dataset.sceneAnchor : undefined) ?? null;
    const onEnter = (event: Event) => spatialStore.setState({ highlight: anchorOf(event.target) });
    const onLeave = (event: Event) => {
      const next = anchorOf((event as FocusEvent | PointerEvent).relatedTarget);
      spatialStore.setState({ highlight: next });
    };
    document.addEventListener('pointerover', onEnter, { passive: true });
    document.addEventListener('focusin', onEnter);
    document.addEventListener('pointerout', onLeave, { passive: true });
    document.addEventListener('focusout', onLeave);
    return () => {
      document.removeEventListener('pointerover', onEnter);
      document.removeEventListener('focusin', onEnter);
      document.removeEventListener('pointerout', onLeave);
      document.removeEventListener('focusout', onLeave);
    };
  }, []);

  const hud = debugRequested() && (
    <Suspense fallback={null}>
      <SpatialDebugHud />
    </Suspense>
  );
  if (!load || tier < 2) return hud || null;
  return (
    <>
      <SceneBoundary>
        <Suspense fallback={null}>
          <SpatialCanvas />
        </Suspense>
      </SceneBoundary>
      {hud}
    </>
  );
}
