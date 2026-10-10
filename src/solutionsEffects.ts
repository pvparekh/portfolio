import { useLayoutEffect, useRef } from 'react';

/**
 * Progressive enhancement for the two solutions pages only.
 * Motion is applied without inserting wrappers or changing the DOM hierarchy,
 * which preserves existing grid layouts, typography, anchors, and interactions.
 * Without JS, IntersectionObserver, or when reduced motion is requested,
 * every element remains fully visible.
 */
export function useSolutionsScrollReveal() {
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const selector = [
      '.sol-section-intro',
      '.sol-problem',
      '.sol-service',
      '.sol-case',
      '.sol-proof-card',
      '.sol-process-step',
      '.sol-tooling-note',
      '.sol-contact-panel',
      '.sol-proof-close',
    ].join(', ');

    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
    let observer: IntersectionObserver | null = null;

    const reset = () => {
      observer?.disconnect();
      observer = null;
      root.classList.remove('sol-motion-enabled');
      for (const element of elements) {
        element.classList.remove('sol-reveal-target', 'sol-revealed');
      }
    };

    const setUp = () => {
      reset();
      if (media.matches) return;

      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('sol-revealed');
          observer?.unobserve(entry.target);
        }
      }, { threshold: 0.04, rootMargin: '0px 0px -5% 0px' });

      const viewportHeight = window.innerHeight;
      for (const element of elements) {
        const bounds = element.getBoundingClientRect();
        element.classList.add('sol-reveal-target');
        // In-view and previously passed content is never initially hidden.
        if (bounds.top <= viewportHeight * 0.94) {
          element.classList.add('sol-revealed');
        } else {
          observer.observe(element);
        }
      }
      root.classList.add('sol-motion-enabled');
    };

    setUp();
    media.addEventListener('change', setUp);
    return () => {
      media.removeEventListener('change', setUp);
      reset();
    };
  }, []);

  return pageRef;
}
