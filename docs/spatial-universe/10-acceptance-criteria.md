# 10 — Acceptance criteria and verification plan

Every gate needs **evidence** (test output, screenshot, recording, or measurement file). "Not verified" is an acceptable status if it is stated with a reason; "pass" without evidence is not.

| # | Area | Criterion (measurable) | Evidence / method |
|---|---|---|---|
| G1 | Functional preservation | DOM text and link snapshots for `/`, `/solutions`, `/software` are identical to M0, except the documented additions (Motion toggle, homepage skip link, visually-hidden tagline list, og:image tags) | `tests/baseline/dom-text.spec.ts` |
| G2 | Protected content | `scripts/check-experience-baseline.mjs` PASS | Build log |
| G3 | Routing | Direct load, refresh, nav clicks, hash deep links, back/forward, dropdown hover gating, Escape, mobile menu, and metadata/canonical per page all behave as on M0 | `tests/spatial/routes.spec.ts` + existing `check-software-page.mjs` |
| G4 | Existing suites | `check-software-page`, `check-solutions-motion`, `compare-existing-routes` green | CI log |
| G5 | Visual coherence | Every station matches its storyboard row; the anti-goals checklist (04) is signed per route; darkness ratio ≥ 70 % of pixels < 4 % luminance per station | Screenshot gallery + histogram script |
| G6 | Forward/reverse determinism | The same scroll position renders the same frame arriving from either direction (test mode): diff ≤ 0.1 % | `determinism.spec.ts` |
| G7 | Smoothness (desktop) | Scripted scroll through all sections on the integrated-GPU reference: p95 frame time ≤ 16.7 ms; 0 long animation frames > 50 ms after warm-up; on a high-refresh discrete GPU report the achieved fps (target ≥ 90) | `perf-scroll.mjs` JSON + hardware notes |
| G8 | Smoothness (mobile) | Tier 2 on ≥ 2 real reference devices: p95 ≤ 25 ms (target 16.7); thermal soak result recorded | Device log |
| G9 | Responsive layout | No horizontal overflow at 320 px; 44 px touch targets; the 10-viewport matrix passes; address-bar collapse causes no jump | Existing matrix + mobile recording |
| G10 | Readability | Every text block ≥ 4.5:1 (≥ 3:1 large) against the brightest canvas sample behind it; no camera motion > 0.5 units while body text is centered | `contrast.spec.ts`, camera telemetry |
| G11 | Keyboard | All interactive elements reachable in the M0 order; focus visible over the canvas; Motion toggle ≤ 3 Tabs from start; focus triggers the same highlights as hover | `a11y.spec.ts` + manual run |
| G12 | Reduced motion | With `prefers-reduced-motion: reduce` or Motion Off: camera pose constant while scrolling, no reveal transforms, no continuous render loop (`frameloop` demand), and all content visible | `reduced-motion.spec.ts` |
| G13 | Pause control | Motion toggle persists across routes and reloads; satisfies WCAG 2.2.2 | Spec + manual |
| G14 | Screen readers | Canvas not announced; the hero name announced once; tagline not chattering | VoiceOver + NVDA notes (human) or "not verified" |
| G15 | GPU resources | Draw calls ≤ 12 desktop / ≤ 6 mobile; `renderer.info.memory` stable after 20 route swaps; context loss → CSS fallback within 1 frame, recovery on restore; two losses → tier 1 | `lifecycle.spec.ts`, `fallback.spec.ts` |
| G16 | Loading | Initial JS ≤ 145 kB gzip; scene chunk ≤ 270 kB gzip and lazy; LCP is the DOM hero text and within +100 ms of M0 (desktop) / no regression (mobile); CLS ≤ 0.02 | Bundle guard, Lighthouse vs M0 |
| G17 | Fallbacks | `?spatial=off`, WebGL disabled, Save-Data, and render errors each produce the tier-1 site with no console errors | `fallback.spec.ts` |
| G18 | Browser compatibility | Matrix in 07 §6 executed; each row pass / fail / not tested with a reason | Matrix log |
| G19 | Build and type safety | `npm run build` (guard + `tsc` + Vite) green; no `any` in `src/spatial/` (lint rule or grep check) | CI |
| G20 | Automated tests | `npm run test:all` green locally and in CI | CI |
| G21 | Rollback | `VITE_SPATIAL=off` preview is visually identical to M0; revert procedure documented | Preview screenshots |
| G22 | Production safety | No commit to `main`, no production deploy, no Vercel production setting change without the owner's explicit authorization | Git log / PR history |

## Verification sequence per milestone

1. Automated: build → unit → e2e (DOM, routes, fallback, determinism, contrast, a11y) → visual.
2. Real browser: screenshots of changed stations at 1440×900 and 390×844, compared side by side with the storyboard and M0.
3. Recording: forward and backward scroll through the changed sections.
4. Measurement (if rendering changed): the perf harness on the reference desktop, and mobile devices at M7+.
5. Written PR summary: what passed, what failed, what was not verified and why.

## Limitations of this research phase (stated, not hidden)

- Real-device mobile performance, Safari/iOS behavior and screen-reader output were **not** tested here. Only a Chromium-based desktop pane was available. The hero LCP and the animation timing of the current site were not measured (the pane was backgrounded and throttled).
- Reference analyses distinguish verified implementation (case studies, docs, bundle inspection) from visual inference; several items could not be verified (see 01).
- No prototype was built. Every visual claim about Slipstream is a design intention, to be proven or corrected in M2–M3 with screenshots.
