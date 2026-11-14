import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { LightboxItem } from './types';

interface State { images: LightboxItem[]; index: number }

const OPEN_EVENT = 'journey-inspect';
/** Fired with `detail: boolean` when the viewer opens or closes (the journey pauses ambient rendering). */
export const STATE_EVENT = 'journey-inspect-state';

/** Open the viewer on a set of images or clips (3D exhibit screens and gallery filmstrips share it). */
export function openLightbox(images: LightboxItem[], index: number) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { images, index } }));
}

const preloaded = new Set<string>();
function preload(item: LightboxItem | undefined) {
  if (!item || item.video) return;
  const key = item.srcSet ?? item.src;
  if (preloaded.has(key)) return;
  preloaded.add(key);
  const img = new Image();
  img.decoding = 'async';
  if (item.srcSet) { img.sizes = '100vw'; img.srcset = item.srcSet; }
  img.src = item.src;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Full-size viewer for screenshots and clips. A modal dialog: focus moves in
 * and is restored on close; Escape, the backdrop and the close button dismiss
 * it; arrow keys and swipes step through the set. Only the neighbours of the
 * open item are fetched, so a gallery costs nothing until someone opens it.
 */
export default function Lightbox() {
  const [state, setState] = useState<State | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onOpen = (event: Event) => {
      returnFocus.current = document.activeElement;
      setState((event as CustomEvent<State>).detail);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const open = !!state;
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.documentElement.classList.add('journey-inspecting');
    window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: true }));
    return () => {
      document.documentElement.classList.remove('journey-inspecting');
      window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: false }));
    };
  }, [open]);

  useEffect(() => {
    if (!state) return;
    preload(state.images[(state.index + 1) % state.images.length]);
    preload(state.images[(state.index - 1 + state.images.length) % state.images.length]);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'Tab') {
        // Keep focus inside the dialog.
        const focusables = [...document.querySelectorAll<HTMLElement>('.journey-inspect button, .journey-inspect video[controls]')];
        const i = focusables.indexOf(document.activeElement as HTMLElement);
        const next = focusables[(i + (event.shiftKey ? -1 : 1) + focusables.length) % focusables.length];
        next?.focus();
        event.preventDefault();
      }
    };
    // The page must not scroll behind an open dialog (the journey camera would leave the exhibit).
    // Blocking the inputs rather than hiding overflow avoids a scrollbar-width resize.
    const block = (event: Event) => event.preventDefault();
    const blockKeys = (event: KeyboardEvent) => {
      const onControl = (event.target as Element | null)?.closest?.('button, video');
      if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key) || (event.key === ' ' && !onControl)) event.preventDefault();
    };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', blockKeys);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('keydown', onKey);
    };
  });

  if (!state) return null;
  const item = state.images[state.index];
  const many = state.images.length > 1;
  function close() {
    setState(null);
    (returnFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
  }
  function step(direction: number) {
    if (!state || !many) return;
    setState({ ...state, index: (state.index + direction + state.images.length) % state.images.length });
  }

  return (
    <div
      className={`journey-inspect ${item.caption ? 'has-caption' : ''}`}
      role="dialog" aria-modal="true" aria-label={item.alt}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
      onPointerDown={event => { if (event.pointerType !== 'mouse') swipe.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={event => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const dx = event.clientX - s.x, dy = event.clientY - s.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
      }}
    >
      <figure className="journey-inspect-figure">
        {item.video ? (
          <video
            key={item.video} src={item.video} poster={item.poster} width={item.width} height={item.height}
            muted loop playsInline controls autoPlay={!reducedMotion()} preload="metadata" aria-label={item.alt}
          />
        ) : (
          <img key={item.src} src={item.src} srcSet={item.srcSet} sizes="100vw" width={item.width} height={item.height} alt={item.alt} decoding="async" />
        )}
        {item.caption && (
          <figcaption className="journey-inspect-caption">
            {item.label && <span>{item.label}</span>}
            {item.caption}
          </figcaption>
        )}
      </figure>
      <button ref={closeRef} type="button" className="journey-inspect-close" aria-label="Close" onClick={close}><X size={20} /></button>
      {many && (
        <>
          <button type="button" className="journey-inspect-step is-prev" aria-label="Previous" onClick={() => step(-1)}><ChevronLeft size={22} /></button>
          <button type="button" className="journey-inspect-step is-next" aria-label="Next" onClick={() => step(1)}><ChevronRight size={22} /></button>
          <p className="journey-inspect-count" aria-hidden="true">{state.index + 1} / {state.images.length}</p>
        </>
      )}
    </div>
  );
}
