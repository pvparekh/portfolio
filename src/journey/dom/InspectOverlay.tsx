import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Inspect { images: { src: string; alt: string }[]; index: number }

/**
 * Full-size view of an exhibit screenshot, opened by clicking a 3D screen.
 * A modal dialog: focus moves in and is restored on close; Escape, the
 * backdrop and the close button dismiss it; arrow keys step through the set.
 */
export default function InspectOverlay() {
  const [state, setState] = useState<Inspect | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

  useEffect(() => {
    const onOpen = (event: Event) => {
      returnFocus.current = document.activeElement;
      setState((event as CustomEvent<Inspect>).detail);
    };
    window.addEventListener('journey-inspect', onOpen);
    return () => window.removeEventListener('journey-inspect', onOpen);
  }, []);

  useEffect(() => {
    if (!state) return;
    closeRef.current?.focus();
    document.documentElement.classList.add('journey-inspecting');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'Tab') {
        // Keep focus inside the dialog.
        const focusables = [...document.querySelectorAll<HTMLElement>('.journey-inspect button')];
        const i = focusables.indexOf(document.activeElement as HTMLElement);
        const next = focusables[(i + (event.shiftKey ? -1 : 1) + focusables.length) % focusables.length];
        next?.focus();
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('journey-inspecting');
    };
  });

  if (!state) return null;
  const image = state.images[state.index];
  const many = state.images.length > 1;
  function close() {
    setState(null);
    (returnFocus.current as HTMLElement | null)?.focus?.();
  }
  function step(direction: number) {
    if (!state || !many) return;
    setState({ ...state, index: (state.index + direction + state.images.length) % state.images.length });
  }

  return (
    <div className="journey-inspect" role="dialog" aria-modal="true" aria-label={image.alt} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <figure className="journey-inspect-figure">
        <img key={image.src} src={image.src} alt={image.alt} />
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
