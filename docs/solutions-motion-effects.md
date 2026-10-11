# Solutions Motion Effects

This release adds visual motion only to `/solutions` and `/software`; Portfolio remains unchanged.

## Motion signatures

- Data Solutions uses a sequential pipeline entrance, upward scroll reveals, and a short section-line trace.
- Software Solutions uses a softer lateral hero entrance, scaled interface entrance, subtle application detail movement, and gentle scroll reveals.
- Section layout, copy, interactive controls, routes, and content are unchanged by this release.

## Accessibility and behavior

The `useSolutionsScrollReveal` hook progressively enhances existing elements using IntersectionObserver, with no extra layout wrappers. Content starts visible until the observer is configured, and targets already in view are shown immediately. Reveals run once as the reader scrolls down. Reduced-motion users and print views receive static fully visible content.

## Validation

PR #7 passed the protected experience baseline, TypeScript and production Vite build, existing navigation and ten-viewport browser checks, additional animations/reduced-motion tests, and production-versus-feature checks for Portfolio's rendered content and layout. Motion captures were reviewed on desktop and mobile.

This documentation-only commit is intended to retrigger Git deployment after the initial merge did not appear in the Vercel production deployment feed.
