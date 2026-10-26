# 11 — Implementation log: desktop end-to-end (2026-10-26)

**Branch:** `feat/spatial-universe` (from `docs/spatial-universe-blueprint`, which is `origin/main` + the blueprint). **Scope of this pass:** the complete desktop web experience across `/`, `/solutions`, and `/software`. Touch devices intentionally keep today's site (CSS streaks) until the mobile pass. **Production:** untouched; nothing merged to `main`.

## What was built

| Area | Implementation |
|---|---|
| Loader (eager, no three.js) | `src/spatial/core/*` (store, tier detection, anchors, pure scroll map), `src/spatial/dom/*` (`SpatialMount`, `MotionToggle`, `sceneAnchor`) |
| Scene (lazy chunk) | `src/spatial/scene/SpatialCanvas.tsx` (persistent R3F canvas, context-loss handling, adaptive quality), `SceneDirector.tsx` (scroll→camera, formations, haze, floor), `Effects.tsx` (tier-3 bloom, its own lazy chunk) |
| Signature shader | `scene/field/filament.vert.glsl` / `.frag.glsl`: one instanced draw for every filament; free flow and 10 formation kinds computed in the vertex shader; hairlines kept ≥1 device px; focal-falloff fake DoF; atmospheric fog; reading scrim |
| Worlds (data, not code) | `scene/worlds/portfolio.ts` (Slipstream: grid → halo → role gantries → three project systems → skills lap from above → horizon), `solutions.ts` (Confluence), `software.ts` (Assembly) |
| Content anchors | `ref={sceneAnchor(...)}` added to existing elements in `App.tsx`, `SolutionsPage.tsx`, `SoftwarePage.tsx`. No wrappers, no text changes; the `EXPERIENCE` block is byte-identical (build guard passes) |
| Hero | The canvas replaces the CSS streaks, grid and glow only while it is rendering. "Name opens": as the camera dollies forward, the DOM name holds near the viewport centre, grows, parts slightly and dissolves, while the tagline and sub-copy clear first |
| Readability | Shader scrim over the content container; sections become transparent only under `html.spatial-ready`; translucent text panels get near-opaque surfaces; soft dark text halo on copy |
| Accessibility | Canvas `aria-hidden`, `pointer-events:none`; pause/play control in the nav (WCAG 2.2.2) that persists; `prefers-reduced-motion` → still frames (camera cuts to pose, no flow, render on demand); hover **and keyboard focus** drive scene highlights |
| Resilience | Lazy load after idle; error boundary → standard site for the session; `webglcontextlost` → CSS fallback, recovery on restore, second loss within 60 s demotes; build flag `VITE_SPATIAL=off`; runtime `?spatial=off|css|lite|full` |

## Deviations from the blueprint (and why)

1. **No `drei`, no WebGL name twin.** drei pulled a second three.js copy (via stats-gl) and was only needed for SDF text. The name stays DOM (crisp, selectable, the LCP element), and the "name opens" moment is done with transforms. This removes the 1 px alignment risk entirely.
2. **One integration branch with milestone commits** instead of one branch per milestone, at the owner's request to go end to end quickly.
3. **Touch devices → tier 1** until the dedicated mobile pass (per the owner's instruction: desktop first).
4. **Structures were moved off the reading column** after the first visual review (the gantries became three-sided, the lanes run along the floor toward the horizon, and the Software modules sit far back). The first pass was too bright and crossed body copy; see the review notes below.
5. **Side-by-side anchors** (Review Bot and AetherFlow share a row) split their shared span so each still gets a dwell.

## Verification (all run locally on this branch)

| Check | Result |
|---|---|
| `npm run build` (experience guard + `tsc` + Vite) | PASS |
| `npm run test:unit` (Vitest: scroll map monotonic/flat/stateless; 14 tier cases) | 19/19 PASS |
| `scripts/check-software-page.mjs` (existing) | PASS |
| `scripts/check-solutions-motion.mjs` (existing) | PASS |
| `scripts/compare-existing-routes.mjs` (existing; vs production `main` built in a worktree, 10 viewports × 2 routes) | PASS |
| `scripts/check-spatial.mjs` (new; real GPU) | PASS: visible text and links identical with and without the scene on all 3 routes; determinism (same pose arriving from top or bottom); pause toggle freezes and persists; one persistent canvas across route changes and back navigation; context loss → fallback → recovery; reduced motion → still; touch → standard site |
| `scripts/check-spatial.mjs` with `SPATIAL_GPU=swiftshader` (CI mode) | PASS |

## Measurements (measured, with hardware stated)

| Metric | Result | Budget | Notes |
|---|---|---|---|
| Initial JS (gzip) | **139.3 kB** (`main` 136.0 + shared runtime 3.3) | ≤ 145 kB | Production baseline 135.45 kB |
| Scene chunk (gzip) | **255.4 kB** (R3F + three 244.0, scene 11.5) | ≤ 270 kB | Lazy, after idle |
| Tier-3 bloom chunk (gzip) | **22.7 kB** | (in the 270 budget) | Total tier 3 = 278 kB, **8 kB over budget**. Option: drop R3F for vanilla three, or replace the postprocessing wrapper |
| Frame time, scripted 14 s scroll through each route, 1440×900, DPR 1 | p50 16.7 ms, p95 16.7–16.8 ms, max 16.8 ms (60 Hz locked) | p95 ≤ 16.7 ms | **NVIDIA RTX 3080 Laptop GPU only.** Integrated-GPU, Safari, and high-DPR results are **not measured yet** |
| Draw calls | 1 field + 1 floor + 1 haze (+ bloom passes) | ≤ 12 | `renderer.info` shows 4 geometries |

## Visual review notes (from screenshots, `assets/implementation/`)

- **Round 1:** too much light (the hero read as a warp tunnel, well under 70 % darkness); gate beams and module grids crossed body copy; the contact scene converged radially. **Fixed** by halving free-filament intensity, stronger fog, smaller formation shares, three-sided gantries, floor lanes, background modules, and ground-hugging horizon streams.
- **Round 2:** the About halo was too dense up close (half the pool on the ring). **Fixed** by cutting formation shares 40 % across all worlds.
- **Round 3:** "name opens" overlapped the tagline. **Reworked** as a held push-in with the copy clearing first.
- **Round 4:** gate posts crossed translucent Data process cards. **Fixed** with near-opaque panel surfaces and wider, sparser gates.

## Known gaps / next

- **Mobile pass** (tier 2 compositions, address-bar handling, real-device measurements): not started, by design.
- Performance on integrated GPUs, Safari/macOS, Firefox, and DPR 2 is unmeasured. The adaptive quality stepper (p90 > 21 ms → fewer filaments → DPR 1 → no bloom) is implemented but untested on slow hardware.
- Screen-reader passes (VoiceOver and NVDA) not done.
- The tier-3 bundle is 8 kB over budget (see above).
- Route transitions are a cut plus streak burst; the "fork" transition from the storyboard is not implemented.
