# 09 — Claude Code implementation prompt bank

Dependency-ordered prompts for later sessions. Run them **in order**, one per session (or per milestone branch). Each prompt assumes the docs in `docs/spatial-universe/` are the source of truth; **research is finished, and these prompts do not reopen decisions** unless a stop condition fires.

Paste the **shared preamble** at the top of every prompt.

---

## Shared preamble (paste first, every time)

```
Repository: C:\Dev\PortfolioWebsite (github.com/pvparekh/portfolio). Read before coding:
docs/spatial-universe/README.md, 00-repository-audit.md (§10 preservation contract),
03-art-direction.md, 04-storyboard.md, 05-solutions-pages.md, 06-technical-architecture.md,
07-performance-accessibility-compat.md, 10-acceptance-criteria.md.

Hard rules:
- git fetch first. Work only on the milestone branch named below, created from the latest
  origin/feat/spatial-universe. Never commit to, merge into, or deploy main. Never change Vercel
  production settings. PRs target feat/spatial-universe.
- Do not change any visible copy, link, CTA, download, mailto draft, section id, heading text, or
  the EXPERIENCE block (build guard: scripts/check-experience-baseline.mjs must PASS byte-for-byte).
  Do not invent metrics, projects, or claims; no new visible text except the Motion toggle label.
- DOM content is the source of truth; the canvas is aria-hidden decoration. No scroll hijacking,
  no scroll snapping, no Lenis/GSAP unless this prompt says so.
- Stack pins: three 0.186.x, @react-three/fiber ^9.8.2, @react-three/drei ^10.7.9 (deep imports),
  postprocessing 6.39.x + @react-three/postprocessing 3.2.x (tier 3 only). React 19 / Vite 8 /
  TS 6 / Tailwind 4 / framer-motion 12 stay as they are.
- Everything spatial lives under src/spatial/ (core/ has no three.js import; scene/ is lazy only).
- Keep green: npm run build, scripts/check-software-page.mjs, scripts/check-solutions-motion.mjs,
  scripts/compare-existing-routes.mjs, and every Playwright spec added by earlier milestones.
- Verify in a real browser: take screenshots at 1440x900 and 390x844 of every changed state,
  and look at them critically against the storyboard. A passing build is not evidence of design
  quality. Never claim a performance number you did not measure; label estimates as estimates.
- End with: a PR description (what/why, screenshots, test output, measurements, preservation
  checklist, known gaps) and stop.
```

---

## P00 — M0 Baseline preservation and test harness

**Objective.** Freeze today's behavior so every later change is provably non-destructive, and create the integration branch and flag plumbing with zero visual change.

**Context.** No unit-test runner exists. Playwright is installed `--no-save` only in CI. The CI workflow triggers on four hard-coded branch names. `scripts/compare-existing-routes.mjs` compares the feature build against production main.

**Files.** `package.json`, `.github/workflows/software-solutions-validation.yml` (or a new `spatial-validation.yml`), `scripts/`, new `tests/` folder, `playwright.config.ts`, `vite.config.ts`, `src/vite-env.d.ts`.

**Prerequisites.** None. Create `feat/spatial-universe` from `origin/main`, then `feat/spatial-m00-baseline` from it.

**Requirements.**
1. Add dev deps: `@playwright/test@^1.64`, `vitest` (latest stable), `@axe-core/playwright`. Add scripts: `test:unit`, `test:e2e`, `test:visual`, `test:all`.
2. `playwright.config.ts`: `webServer` = `vite preview --host 127.0.0.1 --port 4173 --strictPort` after build; projects `desktop-chromium` (1440×900) and `mobile-chromium` (390×844, isMobile, hasTouch); Chromium launched with `--use-angle=swiftshader --enable-unsafe-swiftshader` (prep for WebGL).
3. `tests/baseline/dom-text.spec.ts`: for `/`, `/solutions`, `/software`, extract `main` innerText (masking the typed tagline element and tenure strings) and all `a[href]` (href + text) to JSON snapshots committed under `tests/baseline/__snapshots__/`. These snapshots become the **content preservation oracle** for all later milestones.
4. `tests/baseline/visual.spec.ts`: full-page `toHaveScreenshot` per route and project, animations disabled, typed tagline masked.
5. `tests/baseline/a11y.spec.ts`: axe scan per route; record current violations as a baseline file (do not fix now).
6. `scripts/measure-baseline.mjs`: run Lighthouse (desktop + mobile presets) via `npx lighthouse` against the local preview and against `https://www.parthparekh.dev` (read-only), saving JSON to `docs/spatial-universe/measurements/m0/`. Record LCP, CLS, TBT, and JS transfer size.
7. Flag plumbing: `VITE_SPATIAL` typed in `vite-env.d.ts`; `src/spatial/core/flags.ts` exporting `spatialEnabled()` (env flag AND not `?spatial=off`). Nothing reads it yet.
8. CI: add `feat/spatial-**` to triggers (or a new workflow) running build, unit, e2e (no visual on CI until baselines exist for Linux; generate Linux baselines in CI as an artifact).

**Design acceptance.** Pixel-identical site (visual diff 0 against production screenshots, apart from masked regions).

**Technical acceptance.** `npm run test:all` passes locally; CI passes on the branch; bundle size unchanged (±0.5 kB).

**Preservation.** No `src/` behavior change except the inert `flags.ts`.

**Tests.** As above.

**Deliverables.** PR `feat/spatial-m00-baseline → feat/spatial-universe`; `docs/spatial-universe/measurements/m0/README.md` with a metrics table (measured values only).

**Stop / failure.** If Lighthouse cannot run in this environment, record that and skip it rather than fabricating numbers. If the visual baseline is flaky (>0 diff on rerun), fix the masking/determinism before continuing; do not raise thresholds above 0.1 %.

---

## P01 — M1a Spatial core (no three.js)

**Objective.** Build the framework-light core: store, capability tiers, motion preference, anchors, and the pure scroll map, all fully unit-tested.

**Files.** `src/spatial/core/{store,capability,motionPreference,anchors,scrollMap,flags}.ts`, `src/spatial/dom/useSceneAnchor.ts`, `tests/unit/*.test.ts`.

**Prerequisites.** P00 merged.

**Requirements.**
1. `store.ts`: `createSpatialStore<T>()` with `getState/setState/subscribe` plus `useSpatial(selector)` via `useSyncExternalStore`. State: `page`, `tier`, `motion: 'full'|'still'`, `ready`, `lost`, `anchors` (version counter), `transition`.
2. `capability.ts`: `detectTier()` per 07 §1 (pointer, saveData, deviceMemory, webgl2 probe with immediate context release, URL/localStorage/sessionStorage overrides). Pure, injectable environment for tests.
3. `motionPreference.ts`: combines `prefers-reduced-motion` (live listener) with the persisted toggle (`localStorage['spatial-motion']`).
4. `anchors.ts`: registry of `{id, el}`; measures document-space `top/height` on ResizeObserver(documentElement), `document.fonts.ready`, `details` `toggle` (capture listener), and route changes; batches with rAF; bumps the version.
5. `useSceneAnchor(id)`: returns a ref callback that sets `data-scene-anchor` and registers/unregisters. **No wrapper elements.**
6. `scrollMap.ts`: `buildScrollMap(anchors, stations, viewportH) → Keyframe[]` and `mapScroll(map, y) → s` implementing plateaus and smootherstep transits per 04 conventions.

**Design acceptance.** N/A (no visuals).

**Technical acceptance.** Unit tests: tier matrix (≥ 12 cases); `mapScroll` monotonic non-decreasing, continuous (max jump < 1e-3 per px), flat within plateaus (|Δs| < 1e-6), identical output regardless of call order (no hidden state); anchors re-measure after a `<details>` toggle (jsdom or Playwright). Initial bundle grows ≤ 3 kB gzip.

**Preservation.** Anchors may be attached to existing elements via ref callbacks only; DOM-text snapshot unchanged.

**Tests.** `test:unit`, plus the P00 suites.

**Deliverables.** PR with test output and the bundle size delta.

**Stop / failure.** If attaching refs requires changing the `EXPERIENCE` block or heading text, stop and attach anchors to the parent `article`/`div` elements instead.

---

## P02 — M1b Canvas mount, lifecycle, Motion toggle, debug overlay

**Objective.** Mount a persistent, lazy, fault-tolerant R3F canvas showing only the grid floor; the Motion toggle works; a debug overlay visualizes anchors and plateaus.

**Files.** `src/main.tsx` (mount `SpatialMount` as a sibling of the routed page), `src/spatial/dom/{SpatialMount,MotionToggle}.tsx`, `src/spatial/scene/{SpatialCanvas,SceneDirector,GridFloor,CameraRig}.tsx`, `src/spatial/scene/debug/SpatialDebug.tsx`, `src/style.css` (only `html.spatial-ready` rules), `package.json` (three, fiber, drei, @types/three).

**Prerequisites.** P01.

**Requirements.**
1. `SpatialMount`: if `spatialEnabled() && tier >= 2`, `requestIdleCallback` (2 s timeout) → `React.lazy(() => import('../scene/SpatialCanvas'))` in an ErrorBoundary; on error set `sessionStorage['spatial-demoted']` and stay on tier 1.
2. `SpatialCanvas`: fixed full-viewport `<Canvas>` (`aria-hidden`, `pointer-events:none`, z-index below content), `dpr={[1, tier===3?2:1.5]}`, `gl={{ antialias:false, powerPreference:'high-performance', alpha:false }}`, background `#08080D`, `frameloop` from motion mode, context lost/restored handlers per 07 §4, `PerformanceMonitor` wired to the store (no regressions acted on yet), and `gl.compile` warm-up before setting `ready`.
3. When `ready`: add `html.spatial-ready`. CSS fades `.speed-line` out over 400 ms and makes `#hero, #about, #experience, #projects, #skills, #contact` backgrounds transparent **only under that class** (they are inline styles today, so use a class-scoped `!important` override or move the inline backgrounds to classes without changing computed styles when not ready).
4. `GridFloor`: an infinite shader grid matching `.circuit-grid` (1px lines, amber 2.2 %, cell ≈ 1.2 units, fwidth antialiasing, distance fade).
5. `CameraRig`: reads `scrollY` per frame, uses `scrollMap` with a placeholder single-station world, applies damping λ=7; test mode `?spatial=test` disables damping and freezes `uTime`.
6. `MotionToggle`: `<button aria-pressed>` in the hero HUD area (desktop: next to STATUS in the telemetry bar; mobile: in the nav menu). Label exactly "Motion" with state text "On"/"Off" (the only new visible text allowed).
7. `SpatialDebug` (only with `?spatial-debug` in dev or preview): overlay listing anchors, current `s`, active station, plateau state, FPS, draw calls, tier.
8. Expose `window.__spatial` (dev/test builds only): `{ getPose, setScroll, renderNow, loseContext, tier }`.

**Design acceptance.** With the flag on, the hero looks like today plus a perspective grid floor receding to a horizon; with the flag off, it is identical to M0.

**Technical acceptance.** No three.js code in the initial chunk (inspect build output); initial ≤ 145 kB gzip; forced context loss → CSS fallback visible within 1 frame, recovery on restore; 20 route swaps → no growth in `renderer.info.memory`; reduced-motion emulation → `frameloop` demand.

**Preservation.** DOM-text and link snapshots identical; visual baseline identical with the flag off.

**Tests.** New `tests/spatial/fallback.spec.ts` (flag off, `?spatial=off`, WebGL disabled via `--disable-webgl` project, forced context loss), `tests/spatial/lifecycle.spec.ts` (route swaps, memory), `tests/spatial/motion-toggle.spec.ts`.

**Deliverables.** PR with screenshots (flag on/off), bundle report, and a lifecycle test log.

**Stop / failure.** If R3F 9.8 has a StrictMode double-mount issue with the persistent canvas, mount the canvas outside `StrictMode`'s subtree via a separate root **only** for the canvas, and document why.

---

## P03 — M2a FilamentField (the signature shader)

**Objective.** Implement the instanced filament system: free flow, depth bands, velocity response, fwidth hairlines, fake DoF, fog, and the formation framework (with `free` and `ring` formations implemented and tested).

**Files.** `src/spatial/scene/field/{FilamentField.tsx,filament.vert.glsl,filament.frag.glsl,formations.glsl,palette.ts}`, Vite `?raw` imports for GLSL.

**Prerequisites.** P02.

**Requirements.**
1. Geometry: one `InstancedBufferGeometry` with a unit quad; per-instance `vec4 aA = (lane.x, lane.y, seedZ, speed)`, `vec4 aB = (length, width, hueMix, slot)`; counts from tier (6,000 / 1,200 default).
2. Vertex shader: wrap-around `z = mod(seedZ - uTravel - uTime*speed*v0, range)` relative to the camera; flow direction = forward with a rightward screen-space bias (art principle 4); length × `(1 + k*abs(uVelocity))` capped at 2.5; screen-space minimum width of 1 device px via the projected derivative; near-band focal softness (fake DoF); formation blend `mix(freePos, formationPos(slot), uForm)`.
3. Fragment: cross-section `exp` falloff with a hot core (`#FFE2A8`) to amber body to transparent tail; distance fog to `#08080D` with the ember color shift; reading-scrim attenuation (uniform array of up to 2 screen rects with soft edges); additive blending; HDR core only in tier 3.
4. `palette.ts` exports tokens from 03 §2 as linear-space `THREE.Color`s.
5. Debug controls (only with `?spatial-debug`): sliders for count, v0, k, fog density and core intensity, printing the current values for copying into world data.

**Design acceptance.** In a static hero framing, the field reads as many depths of the original amber line: hairline far, soft and large near, dominant left-to-right flow, never a symmetric warp tunnel; idle speed matches the original 3.3–6.2 s screen crossings for mid-band filaments; fast scrolling stretches them up to 2.5×. Compare side by side with `assets/baseline/home-hero-1440.jpg` and include both in the PR.

**Technical acceptance.** 1 draw call for the field; zero per-frame buffer uploads (verify `renderer.info`); p95 frame time measured on the reference desktop at 1440×900 DPR 2 (report it); determinism test passes (same frame for the same scroll and time in test mode).

**Preservation.** No DOM changes.

**Tests.** `tests/spatial/determinism.spec.ts` (forward vs backward arrival, ≤ 0.1 % diff), visual snapshot of the hero station in test mode.

**Deliverables.** PR with three screenshots (idle, mid-scroll, max velocity), the frame-time table, and shader parameter values.

**Stop / failure.** If additive overdraw makes p95 > 16.7 ms on the integrated-GPU reference at tier 3 defaults, reduce count/DPR defaults until it passes and record the chosen values. Do not ship a default that fails the budget.

---

## P04 — M2b Hero transformation and the "name opens" transit

**Objective.** Make S0 match the storyboard: station pose, horizon haze, P1 world marker, WebGL name twin pixel-aligned with the DOM `h1`, the opening sequence, and the S0→S1 transit where the name parts.

**Files.** `src/spatial/scene/HeroName.tsx`, `src/spatial/scene/worlds/portfolio.ts` (S0 + transit control points), `src/App.tsx` (**only**: `useSceneAnchor('hero')`, `aria-hidden` on decorative hero elements, shortened stagger timings, the alignment hook ref on the name container), `public/fonts/SpaceGrotesk-Bold.woff` + OFL license file.

**Prerequisites.** P03.

**Requirements.**
1. Self-host a **woff** subset (`PARTHEK`) of Space Grotesk 700 (troika cannot read woff2). drei `Text` with `characters="PARTHEK"`, `sdfGlyphSize={128}`.
2. Alignment: each frame (or on resize/scroll), compute the DOM name's bounding rect, unproject it to the name plate's z, and size and position the SDF text so the glyph outlines match within 1 CSS px at 1440×900 and 1920×1080. "PAR" stays amber (`#F59E0B`), the rest `#F1F5F9`. After cross-fade, the DOM name gets `color: transparent` (still selectable and accessible).
3. Lighting: an edge term from nearby filament density (uniform approximations), ≤ 15 % brightness gain; filaments pass both in front of and behind the plate (depth test on).
4. Opening: canvas fade ≤ 600 ms; the grid draws outward from the horizon; the DOM letter stagger shortened to ≤ 350 ms total so LCP isn't delayed; tagline and HUD timings compressed to finish by ~1.2 s.
5. Transit: over hero progress 0 → 0.7, dolly z 9 → −20; lines part ±0.9; FOV 30° → 42°; the existing Framer hero fade remains. Reverse is exact.
6. Tier 2: no WebGL name (DOM only) and no lens-grazing band.

**Design acceptance.** A side-by-side of old vs new hero at 1440 and 390: recognizably the same identity (centered PARTH / PAREKH, amber PAR, telemetry HUD, P1 marker), now with depth. The name is never less legible than today. A screen recording of the transit forward and back is attached.

**Technical acceptance.** DOM `h1` remains the LCP element (verify with a PerformanceObserver log); LCP within +100 ms of the M0 measurement; alignment error ≤ 1 px (automated: render a test frame and compare the DOM glyph mask vs canvas edge detection, or a manual zoomed screenshot comparison documented in the PR).

**Preservation.** Hero text, tagline list, telemetry values and status unchanged; DOM snapshot identical.

**Tests.** Visual snapshots at hero progress 0, 0.35, 0.7 (test mode); LCP check script.

**Deliverables.** PR with recordings, side-by-sides, and LCP numbers.

**Stop / failure.** If troika text cannot be aligned within 2 px across DPRs, ship tier 3 with the DOM name over the canvas (no twin) and file the twin as a polish item. Do not compromise legibility.

---

## P05 — M3a Stations S1 About + S2 Experience (scroll map with plateaus, scrim)

**Objective.** Implement the About Halo and the Experience Straight with role gates keyed to DOM anchors, plus the reading scrim.

**Files.** `worlds/portfolio.ts`, `formations.glsl` (ring, gates, rails), `src/App.tsx` (**only** `useSceneAnchor` refs on `#about`, `#experience`, each `.renaissance-company` article and each `.renaissance-role`; no text or data changes), `src/spatial/scene/Scrim.ts` (measures content column rects → uniforms).

**Prerequisites.** P04.

**Requirements.**
1. Gates count = number of registered `experience:role` anchors (expected 4: DOWC ×2, Perfect Threading, Marketeq); positions keyed to each role heading's anchor; the gate for the role with `.is-current` pulses green `#22C55E` with a ≥ 1.5 s period.
2. Halo ring per 04 S1; arcs echoing the two profile panels.
3. Plateaus: About `[0.18, 0.82]`; Experience is a *moving dwell* (piecewise-linear between role anchors, speed ≤ 0.02 units/px).
4. Scrim: measure the content column rects (e.g. `.max-w-6xl` containers within the active section) on anchor version change; pass up to 2 rects; strength per station.
5. Hover/focus on a company name brightens its gate(s) (store event; no React re-render in the frame loop).

**Design acceptance.** Gates pass the camera as each role heading reaches the upper third; nothing moves more than 0.5 units while a bullet list is centered; the current-role pulse is subtle. Screenshots at each gate.

**Technical acceptance.** `spatial.contrast.spec.ts` (new): every text block in About and Experience ≥ 4.5:1 against the brightest canvas sample behind it; determinism test across these sections; gate count derived from DOM (unit test with a mocked anchor list of 3 and 5 roles).

**Preservation.** The `EXPERIENCE` guard passes; DOM snapshot identical.

**Tests.** As above, plus visual snapshots per station.

**Deliverables.** PR with screenshots and contrast report.

**Stop / failure.** If the contrast spec fails anywhere, increase scrim strength or reduce density for that station; never lower the threshold.

---

## P06 — M3b Stations S3 Projects, S4 Skills, S5 Contact

**Objective.** Implement Three Systems (ribbon + beads, two-pass planes, four lanes with project tints), the Skills overview crane, and the Contact horizon, plus the hover/focus links.

**Files.** `worlds/portfolio.ts`, `formations.glsl` (ribbon via spline DataTexture, planes, lanes), `src/App.tsx` (anchor refs only on `#projects`, the flagship article, `.is-review-bot`, `.is-aetherflow`, each `.renaissance-architecture-step`, `#skills` and each skill card, `#contact`, and the "Explore Data Solutions" button).

**Prerequisites.** P05.

**Requirements.**
1. FV ribbon: an abstract smooth closed loop (~24 control points, **not** a real circuit outline); five beads light sequentially, keyed to the five `.renaissance-architecture-step` anchors.
2. Review Bot: packets pass two planes and turn green after the second. AetherFlow: four lanes (matching its 4-step flow list).
3. Tints use the existing `PROJECTS[].accent` values, but read them from a small exported constant **or** duplicate the three hex values in `worlds/portfolio.ts` with a comment pointing at `App.tsx`. Do not import App.tsx into the scene chunk.
4. Skills crane: y up to 46 (desktop) / 26 (mobile), ≤ 25°/s angular velocity; six lanes, brightened by the hovered/focused card; the faint path behind visible.
5. Contact horizon: speed 0.3·v0, maximum haze ≤ 12 % luminance; hovering "Explore Data Solutions" bends a branch right (preview of the P07 fork).

**Design acceptance.** Each project station is readable as "about that project" without any WebGL text; the Skills shot is the single "wow, scale" moment; Contact feels like arrival and calm. Full-page recording forward and back attached.

**Technical acceptance.** Draw calls ≤ 12; determinism test across all homepage sections; contrast spec passes for all homepage text; max angular velocity unit-tested on station data.

**Preservation.** DOM snapshot identical; project links unchanged.

**Tests.** Visual snapshots per station; anti-goals checklist from 04 completed in the PR.

**Deliverables.** PR with a full homepage recording (desktop + mobile).

**Stop / failure.** If any structure reads as a fake chart or diagram (reviewer judgment), simplify it toward pure light geometry.

---

## P07 — M4 Route transitions and the shared canvas

**Objective.** One canvas across `/`, `/solutions` and `/software`, with progress-driven transitions (fork right / fork left / lateral), deep-link cuts, and back/forward correctness.

**Files.** `src/main.tsx` (emit transition intent from `navigate`/`goToSection`/`popstate` into the store; no routing logic changes), `SceneDirector.tsx`, `scene/transitions/{RouteTransition.tsx,mix.frag.glsl}`.

**Prerequisites.** P06.

**Requirements.**
1. The transition is a 0→1 progress over ≤ 700 ms (interruptible), mixing outgoing and incoming world states (filament formation + camera); optional full-screen mask mix inspired by the Monolith approach, but keep it to one extra pass at most.
2. Content swap timing stays exactly as today (React conditional render). The transition is visual only and must not delay content.
3. Deep links/back-forward that land on a hash: camera **cut** (no travel) plus a 250 ms streak burst.
4. Reduced motion: no transition, an instant cut.
5. World-specific GPU resources are disposed on swap; the filament field and floor persist.

**Design acceptance.** Portfolio → Data reads as the stream forking right; → Software as forking left and rising; reverse paths are coherent. Recordings attached.

**Technical acceptance.** All routing behaviors in 00 §10 verified by Playwright (direct load, refresh, nav clicks, hash links, back/forward, dropdown gating, mobile menu); `renderer.info.memory` stable after 20 alternating swaps; no console errors; `setPageMetadata` unchanged.

**Preservation.** `scripts/check-software-page.mjs` and `compare-existing-routes.mjs` green.

**Tests.** `tests/spatial/routes.spec.ts`.

**Deliverables.** PR with recordings and the memory log.

**Stop / failure.** If the transition causes any measurable delay to content visibility (> 16 ms after route change), make it purely overlaid and non-blocking, or drop it.

---

## P08 — M5 Data Solutions "Confluence"

**Objective.** Build the Confluence world per 05: gate, tangles, four channels, packets with validation rings, five process gates, the delta, and calm contact.

**Files.** `worlds/solutions.ts`, `formations.glsl` (knots, channels, packets, rings), `src/SolutionsPage.tsx` (**anchor refs only** on sections, `.sol-problem`, `.sol-service`, `.sol-proof-card`, `.sol-process-step`, `.sol-case`, the copy-email button event), `solutionsEffects.css` (only if timings must sync).

**Prerequisites.** P07.

**Requirements.** Counts derived from DOM anchors (3 problems, 4 services, N proof cards, 5 steps, approved cases). Validated cyan `#38BDF8` ≤ 8 % of filament share. Camera: downstream drift, ≤ 6 units lateral, y 3.0 → 1.4, no crane. The existing CSS pipeline wipe and connector timings stay; scene lanes sync to them (0.25 s + i·0.58 s). The copy-email click triggers a lane pulse (existing `aria-live` text unchanged).

**Design acceptance.** The page is unmistakably the same universe but a different behavior (chaos → order). It never resembles the homepage lap or the Software modules. Screenshots per section, desktop + mobile.

**Technical acceptance.** `check-solutions-motion.mjs` green; contrast spec extended to `/solutions`; determinism test; budgets hold.

**Preservation.** All copy, `<details>`, mailto draft and copy behavior unchanged (DOM snapshot).

**Tests.** Visual snapshots per section; contrast; a11y.

**Deliverables.** PR with recordings.

**Stop / failure.** If packets/lanes start to imply real throughput data, remove any regularity that reads as a metric (no counters, no labels).

---

## P09 — M6 Software Solutions "Assembly"

**Objective.** Build the Assembly world per 05: layered planes in the hero, missing slots, five module bays, five plinths with classification glyphs, the assembly sequence, and the open slot at contact.

**Files.** `worlds/software.ts`, `formations.glsl` (modules, planes, slots), `src/SoftwarePage.tsx` (anchor refs only; "Related work" link hover → highlight the matching case module).

**Prerequisites.** P08.

**Requirements.** The camera is a lateral truck (+X), constant height, slight dolly per bay. Classification glyphs: solid = client, dashed = independent, dotted = academic, read from each case's existing `.sol-case-tag` text via the anchor registration (no data import). Structural white `#E2E8F0` accent.

**Design acceptance.** Distinct from Confluence and the homepage (camera axis, topology). The DOM "UI CONCEPT" workspace remains clearly the readable illustration; the 3D planes stay behind it and never mimic real client UI.

**Technical acceptance.** All `check-software-page.mjs` assertions green (5 services, 5 cases, first tag "Client website · contract work", last academic, no em dashes, UI concept present, no Data hero diagram); contrast spec extended to `/software`.

**Preservation.** DOM snapshot identical.

**Tests.** Visual snapshots; contrast; a11y.

**Deliverables.** PR with recordings.

**Stop / failure.** If anything visual could be mistaken for a client screenshot, abstract it further.

---

## P10 — M7 Responsive adaptation (tier 2 + real devices)

**Objective.** Make phones first-class: portrait compositions, tier-2 tuning, address-bar resilience, touch-scroll feel, and real-device measurements.

**Files.** `worlds/*.ts` (portrait overrides per station), `capability.ts`, `SpatialCanvas.tsx` (resize policy), `mobile.css` (only `spatial-ready` scoped rules).

**Prerequisites.** P09.

**Requirements.** Portrait station overrides (vanishing point 0.36, lanes vertical at Skills, narrower formations). Ignore viewport height changes < 25 % on touch devices (address bar) for camera/scroll-map rebuild. Adaptive count 600–1,600. Landscape-phone rules respect the existing `mobile.css` media strategy (short touch landscape). Test the existing 10-viewport matrix plus real devices.

**Design acceptance.** On a 390×844 phone, every station reads as intended, text is never crowded by bright filaments, and nothing jumps when the address bar collapses. Recordings from a real iPhone and a real Android are attached (or explicitly marked missing).

**Technical acceptance.** Mobile budgets in 07 §2 measured on ≥ 2 real devices, reported pass/fail; no horizontal overflow at 320 px; 44 px targets preserved; the thermal soak result recorded.

**Preservation.** All mobile layout behaviors from `docs/mobile-responsive-implementation.md` hold.

**Tests.** Mobile Playwright project visual + contrast; manual device log.

**Deliverables.** PR with the device table (device, OS, browser, tier, p50/p95, drops).

**Stop / failure.** If a reference device can't hold ≤ 25 ms p95 at 600 filaments, default that device class to tier 1 and document it.

---

## P11 — M8 Accessibility hardening

**Objective.** Meet the 07 §5 requirements and fix the pre-existing gaps noted in the audit (homepage skip link, typed-tagline semantics, decorative `aria-hidden`).

**Files.** `src/App.tsx` (skip link, `aria-hidden` on decorative hero elements, a visually-hidden tagline list; no copy changes beyond the existing words), `MotionToggle.tsx`, `SiteNav.tsx` (add the Motion toggle to the mobile menu without altering hover-gating logic), CSS for focus parity.

**Prerequisites.** P10.

**Requirements.** The Motion toggle is reachable in ≤ 3 Tab presses from page start on every route; state persists across routes and reloads; focus-visible triggers scene highlights; reduced motion → `still` with no reveal transforms; no flashing > 3 Hz.

**Design acceptance.** Focus rings remain visible over the canvas; still mode looks deliberate (composed stills), not broken.

**Technical acceptance.** axe 0 serious/critical on all routes (compare to the M0 baseline; nothing new); keyboard-only walkthrough script; VoiceOver (macOS/iOS) and NVDA notes recorded by a human or marked pending; reduced-motion emulation test: camera pose constant across scroll.

**Preservation.** Nav hover-gating tests unchanged and green.

**Tests.** `tests/spatial/a11y.spec.ts`, `reduced-motion.spec.ts`.

**Deliverables.** PR with the a11y report.

**Stop / failure.** If the Motion toggle cannot be added to `SiteNav` without touching hover-gating code paths, place it in the hero HUD and footer instead.

---

## P12 — M9 Performance optimization and instrumentation

**Objective.** Hit and **prove** the budgets: known-path culling, warm-up, bloom tuning, adaptive thresholds, the bundle guard, and a repeatable perf harness.

**Files.** `FilamentField` (culling uniforms), `Effects.tsx`, `SpatialCanvas.tsx` (PerformanceMonitor thresholds per 07 §1), `scripts/check-bundle-size.mjs` (added to `build`), `scripts/perf-scroll.mjs` (Playwright, headed, real GPU: scripted scroll, rAF deltas, long-animation-frames, renderer.info).

**Prerequisites.** P11.

**Requirements.** Bundle guard (initial ≤ 145 kB gzip, scene ≤ 270 kB gzip). Perf harness outputs JSON + Markdown to `docs/spatial-universe/measurements/m9/`. Tune defaults so the integrated-GPU reference meets p95 ≤ 16.7 ms at 1440×900.

**Design acceptance.** Optimizations cause no visible regression (visual snapshots within thresholds; any intentional change is re-baselined with justification).

**Technical acceptance.** The budget table in 07 §2, every row marked **measured pass / measured fail / not measured (reason)**. No row may be marked pass without data.

**Preservation.** All previous suites green.

**Tests.** Perf harness runs (document hardware), bundle guard in CI.

**Deliverables.** PR with the measurement report.

**Stop / failure.** If a budget is still failing after reasonable optimization, report it plainly with options (lower default count, drop bloom, tier change); do not hide it.

---

## P13 — M10a Visual refinement pass (art-direction critique loop)

**Objective.** Elevate craft. Run at least **three** critique-and-adjust iterations against the art direction, with screenshots each round.

**Files.** `worlds/*.ts` (poses, FOV, density, tints, scrim), shader constants, CSS timings.

**Prerequisites.** P12.

**Requirements.** For each iteration: capture every station at 1440×900 and 390×844 (tier 3 and 2) plus recordings of each transit. Critique against 03 §1 (one material, darkness ≥ 70 % of the frame, horizontal heritage, the name as anchor, motion has a job, evidence-honest) and 04's anti-goals. Write the critique in `docs/spatial-universe/refinement-log.md` (what is weak, why, the change made, before/after images). Typical targets: composition balance of the hero against the HUD; the near-band filament count (too many feels like rain); haze warmth; bead timing in the FV ribbon; crane easing; route fork elegance; the still-mode compositions.

**Design acceptance.** The owner can watch a 60-second recording and identify it as "the same site, alive", with no moment that feels generic (screensaver, synthwave, warp tunnel). Darkness ratio measured per station (luminance histogram ≥ 70 % below 4 %).

**Technical acceptance.** Budgets and all suites still green after the refinements.

**Preservation.** DOM snapshot identical.

**Tests.** Re-baseline visuals only with a written justification per changed snapshot.

**Deliverables.** PR with the refinement log and a before/after gallery.

**Stop / failure.** If two iterations in a row produce no clear improvement, stop iterating and list the open questions for the owner instead.

---

## P14 — M10b Final polish, production verification, release candidate (no merge)

**Objective.** Produce a release candidate: posters/OG, cross-browser matrix, final measurements, rollback rehearsal, release notes, and **stop for authorization**.

**Files.** `scripts/capture-posters.mjs`, `public/spatial/posters/*`, `index.html`, `solutions/index.html`, `software/index.html` (og:image + twitter card only), `docs/spatial-universe/release-notes.md`, `docs/spatial-universe/measurements/final/`.

**Prerequisites.** P13.

**Requirements.**
1. Generate poster stills (tier 3 render) for the static tier and the OG images; wire `og:image` per entry and in `setPageMetadata` (add the image tag without changing existing text values).
2. Run the full compatibility matrix in 07 §6; record results honestly (pass / fail / not tested).
3. Final performance and Lighthouse runs vs M0 (table of deltas).
4. Rollback rehearsal on the preview: set `VITE_SPATIAL=off` → confirm the site equals M0 visuals; `?spatial=off` works.
5. Verify the acceptance criteria in [10](10-acceptance-criteria.md) one by one with evidence links.
6. Open (or update) a PR **`feat/spatial-universe → main` as a Draft** with the complete evidence; **do not merge**; request explicit authorization.

**Design acceptance.** Owner sign-off on recordings for all three routes, desktop and mobile.

**Technical acceptance.** Every gate in 10 has evidence or an explicit "not verified" with a reason.

**Preservation.** DOM snapshot identical to M0 except the intended additions (Motion toggle, skip link, visually-hidden tagline list, og:image tags).

**Tests.** `npm run test:all`, perf harness, matrix log.

**Deliverables.** A Draft PR to main, release notes, and the final measurements.

**Stop / failure.** Stop after opening the Draft PR. Any production action requires the owner's explicit written go-ahead in chat.

---

## Optional follow-ups (only after release, if requested)

- **WebGPU/TSL port** when R3F v10 is stable and `postprocessing` supports it (or replace bloom with TSL nodes). Benchmark before switching.
- **Build-time prerendering** of the three entries for no-JS crawlers.
- **Portrait image optimization**: switch the About portrait to responsive WebP/AVIF (the 1.26 MB JPEG is currently served). This is independent of the spatial work and could be done any time.
