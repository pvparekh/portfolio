import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { JourneyEngine } from '../core/engine';
import { setLayoutPreference } from '../core/mode';
import type { JourneyDefinition } from '../core/types';
import { getStableViewportHeight } from '../../spatial/core/viewport';
import { isTestMode, readMotionPreference, onReducedMotionChange } from '../../spatial/core/capability';
import { spatialStore, useSpatial } from '../../spatial/core/store';
import { SceneBoundary } from './SceneBoundary';

export interface SceneProps { engine: JourneyEngine }

interface Props {
  definition: JourneyDefinition;
  page: 'portfolio' | 'solutions' | 'software';
  renderPanel: (id: string) => ReactNode;
  loadScene: () => Promise<{ default: ComponentType<SceneProps> }>;
  /** Fixed overlay shown only at the first destination (e.g. telemetry). */
  originHud?: ReactNode;
  footer?: ReactNode;
}

/**
 * Persistent cinematic viewport for one page: a CSS3D stage holding the real
 * DOM content panels, a WebGL scene behind it, and a scroll spacer whose
 * length is the journey. Scroll drives travel; nothing scrolls as a page.
 */
export default function JourneyStage({ definition, page, renderPanel, loadScene, originHud, footer }: Props) {
  const engine = useMemo(() => new JourneyEngine(definition), [definition]);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState(0);
  const [markers, setMarkers] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const Scene = useMemo(() => lazy(loadScene), [loadScene]);
  const motion = useSpatial(state => state.motion);

  const refs = useMemo(() => new Map(definition.panels.map(p => [p.id, (el: HTMLElement | null) => engine.registerPanel(p.id, el)])), [definition, engine]);

  useEffect(() => {
    engine.heightProvider = getStableViewportHeight;
    engine.testMode = isTestMode();
    spatialStore.setState({ page, tier: Math.max(spatialStore.getState().tier, 2) as 2 | 3, ready: true, motion: isTestMode() ? 'still' : readMotionPreference() });
    const offReduced = onReducedMotionChange(() => spatialStore.setState({ motion: readMotionPreference() }));
    engine.attach(stageRef.current!, cameraRef.current!);
    document.documentElement.classList.add('journey-active');
    const offLayout = engine.subscribeLayout(() => {
      const timeline = engine.getTimeline();
      if (!timeline) return;
      setTotal(timeline.total);
      setMarkers(timeline.destinationStarts);
    });
    const offFrame = engine.subscribe(() => {
      const index = Math.min(definition.destinations.length - 1, Math.max(0, Math.round(engine.place)));
      setActive(prev => (prev === index ? prev : index));
      if (hudRef.current) {
        const fade = Math.max(0, 1 - engine.place * 4);
        hudRef.current.style.opacity = String(fade);
        hudRef.current.style.visibility = fade <= 0.01 ? 'hidden' : 'visible';
      }
    });
    const debug = (window as Window & { __journey?: unknown }).__journey = {
      engine,
      frame: () => engine.getFrame(),
      timeline: () => engine.getTimeline(),
    };
    void debug;
    return () => {
      offLayout(); offFrame(); offReduced();
      engine.detach();
      document.documentElement.classList.remove('journey-active');
      spatialStore.setState({ ready: false });
    };
  }, [engine, definition, page]);

  useEffect(() => { engine.ambient = motion === 'full'; engine.wake(); }, [engine, motion]);

  const scrollTo = (top: number) => window.scrollTo({ top: Math.ceil(top) + 1, behavior: 'smooth' });

  // Keyboard users: focusing content inside a panel travels to it.
  const onFocus = (event: React.FocusEvent) => {
    const panel = (event.target as HTMLElement).closest<HTMLElement>('[data-panel]');
    const offset = panel ? engine.panelOffset(panel.dataset.panel!) : null;
    if (offset === null) return;
    const vp = engine.getViewport();
    if (Math.abs(window.scrollY - offset) > vp.height * 0.4) window.scrollTo({ top: Math.ceil(offset) + 1, behavior: 'instant' });
  };

  return (
    <div className={`journey journey--${page}`}>
      <a className="journey-skip" href="#journey-main">Skip to content</a>
      <SceneBoundary>
        <Suspense fallback={null}>
          <Scene engine={engine} />
        </Suspense>
      </SceneBoundary>
      <div className="journey-stage" ref={stageRef} onFocus={onFocus}>
        <main id="journey-main" className="journey-camera" ref={cameraRef}>
          {definition.panels.map(panel => (
            <section key={panel.id} ref={refs.get(panel.id)} className="journey-panel" data-panel={panel.id} data-destination={panel.destination}>
              {renderPanel(panel.id)}
            </section>
          ))}
        </main>
      </div>
      {originHud && <div className="journey-hud" ref={hudRef}>{originHud}</div>}
      <nav className="journey-rail" aria-label="Destinations" data-journey-ui>
        <ol>
          {definition.destinations.map((dest, i) => (
            <li key={dest.id}>
              <button type="button" className={i === active ? 'is-active' : ''} aria-current={i === active ? 'location' : undefined} onClick={() => scrollTo(markers[i] ?? 0)}>
                <span className="journey-rail-dot" aria-hidden="true" />
                <span className="journey-rail-label">{dest.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="journey-layout-switch" onClick={() => setLayoutPreference('classic')}>Standard layout</button>
      </nav>
      <div className="journey-spacer" style={{ height: total ? total + engine.getViewport().height : '100vh' }} aria-hidden="true">
        {definition.destinations.map((dest, i) => (
          <div key={dest.id} id={dest.anchor === 'hero' ? undefined : dest.anchor} className="journey-marker" style={{ top: Math.ceil(markers[i] ?? 0) + 1 }} />
        ))}
      </div>
      {footer}
    </div>
  );
}
