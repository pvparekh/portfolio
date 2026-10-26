# 07 — Performance, accessibility and compatibility strategy

## 1. Quality tiers

| Tier | Name | Who gets it | What renders |
|---|---|---|---|
| **3** | WebGL full | Fine pointer, WebGL2, `deviceMemory ≥ 4` (or unknown), no Save-Data, sustained frame time OK | 4,000–6,000 filaments, bloom (half-res mipmap) + tone mapping, WebGL hero name, pointer wake, DPR ≤ 2 |
| **2** | WebGL lite | Coarse pointer, or tier-3 candidates that regress | 600–1,600 filaments (adaptive), no post-processing (glow baked into the fragment profile), DOM name, no wake, DPR ≤ 1.5 |
| **1** | CSS streaks | No WebGL2, Save-Data, repeated context loss, runtime crash, or sustained p95 > 33 ms in tier 2 | Today's site: six CSS speed lines, grid, radial glow. Content identical |
| **0** | Static | `?spatial=off`, no JS for decoration | No animation; poster still as the hero background if available |

**Reduced motion is orthogonal to tier:** any tier ≥ 2 in `still` mode renders on demand (no continuous loop) at the station pose with frozen filaments. Tier 1 in reduced motion is today's behavior (no streak animation).

**Detection** (`core/capability.ts`, no three.js import): `matchMedia('(pointer: coarse)')`, `navigator.connection?.saveData`, `navigator.deviceMemory`, a throwaway `canvas.getContext('webgl2')` probe (the context is released immediately), `?spatial=` override, `localStorage['spatial-tier']`, and `sessionStorage['spatial-demoted']`.

**Runtime adaptation** (inside the scene): drei `PerformanceMonitor` with bounds tuned to the display's refresh rate. Rule (adapted from the GitHub globe): if the average FPS over a 2 s window stays below 0.92 × refresh (e.g. < 55 at 60 Hz), step down: filament count ×0.7 → DPR −0.25 → disable bloom → tier 2 → tier 1. If it stays above 0.98 × refresh for 6 s, step up one notch (max two flip-flops, then settle).

## 2. Budgets (targets, to be measured; none are claimed as achieved)

### Desktop (reference: a 2021–2023 laptop with an integrated GPU such as Intel Iris Xe / Apple M1 at 1440×900–1920×1080, plus one discrete-GPU desktop at 2560×1440)

| Metric | Budget |
|---|---|
| Frame time p95 (scripted scroll through all sections) | ≤ 16.7 ms at 60 Hz; at 120/144 Hz report the achieved rate, with a target of ≥ 90 fps on discrete GPUs |
| GPU frame time (stats-gl) | ≤ 8 ms on integrated GPUs |
| Long animation frames > 50 ms during scroll | 0 after warm-up |
| Draw calls | ≤ 12 (field, floor, name, structures, post) |
| GPU memory (textures + buffers + render targets) | ≤ 96 MB at DPR 2 |
| Initial JS (pre-scene) | ≤ 145 kB gzip (today 135.45 kB) |
| Scene chunk (lazy) | ≤ 270 kB gzip |
| LCP (hero text) | ≤ 1.8 s on a cable connection; must not regress vs the M0 baseline |
| CLS | ≤ 0.02 (canvas is fixed and out of flow) |
| INP | ≤ 150 ms (nav, disclosures, copy email) |

### Mobile (reference devices: iPhone 12/13 on iOS 17+, Pixel 6a / Galaxy A54 class on Android 14+; test in real hardware, not only emulation)

| Metric | Budget |
|---|---|
| Frame time p95 in tier 2 | ≤ 16.7 ms target; ≤ 25 ms acceptable before auto-downgrade |
| Draw calls | ≤ 6 |
| GPU memory | ≤ 48 MB |
| Thermal soak | 3 minutes of continuous scrolling without dropping a tier on iPhone 13 (record whether it drops) |
| LCP (4G throttled, Lighthouse mobile) | ≤ 2.5 s; no regression vs M0 |
| Battery etiquette | Loop paused when tab hidden; `still` mode renders on demand only |

## 3. GPU techniques that keep it cheap

- **One instanced draw call for all filaments:** 2-triangle quads; all motion in the vertex shader from uniforms (`uTime`, `uTravel`, `uVelocity`, `uFormation*`); per-instance attributes packed into two `vec4`s. No per-frame buffer uploads.
- **Wrap-around field:** instance z is `mod(seedZ − travel, range)` relative to the camera, so a finite pool fills an infinite path.
- **Formations in-shader:** each instance has a stable slot index; formation targets (ring, gates, lanes, ribbon from a small spline `DataTexture`) are computed analytically and blended with `uForm`. Switching sectors costs no CPU.
- **Path-aware density:** filaments outside the camera's forward frustum for the current path segment are collapsed (zero-area) in the vertex shader. Culling is known-path, as in the Santamaria and Persepolis references.
- **Hairlines that survive DPR:** ribbon width = max(world width, `fwidth`-derived 1 device px) and alpha is scaled when sub-pixel, so the original 1px look holds at any DPR.
- **Fake DoF:** near-camera filaments get width and softness from a focal uniform (Resn technique); there is no DoF pass.
- **Additive blending with a capped core:** HDR core values feed bloom only in tier 3; tier 2 encodes glow in the fragment falloff.
- **Fill-rate control:** DPR caps; bloom at half resolution; scrim reduces overdraw under content.
- **No shadows, no lights, no PBR, no textures** beyond a 64 px noise.
- **Shader warm-up:** `gl.compile(scene, camera)` behind the CSS fallback before revealing the canvas, so there is no hitch on first scroll.

## 4. Context loss and memory

- `webglcontextlost` → `preventDefault()`, set `html.spatial-lost` (CSS streaks fade back in), stop the loop. `webglcontextrestored` → rebuild materials and buffers (R3F re-renders), remove the class. Two losses within 60 s → demote to tier 1 for the session.
- iOS: the canvas is sized to the viewport × DPR cap; no offscreen render targets in tier 2; on `pagehide`, shrink the canvas to 1×1 to release memory (WebKit canvas cap workaround).
- Dev-only test hooks: `window.__spatial.loseContext()` (three `forceContextLoss`) to exercise the path in Playwright.

## 5. Accessibility

| Requirement | Implementation | Verification |
|---|---|---|
| Canvas is decorative | `<canvas aria-hidden="true" role="presentation">`, `pointer-events:none`, out of tab order | axe; manual screen-reader pass |
| All information in DOM | No WebGL-only text or data; the WebGL name has a pixel-aligned DOM `h1` that remains the accessible name (transparent, selectable) | DOM text diff vs M0 = identical |
| WCAG 2.3.3 (scroll-linked motion) | `prefers-reduced-motion: reduce` → `still` mode (no camera travel, no velocity response, no reveal transforms) | Playwright `emulateMedia({reducedMotion:'reduce'})`: camera pose constant while scrolling |
| WCAG 2.2.2 (auto-moving background) | **Motion toggle** in the hero HUD and the nav/mobile menu: `<button aria-pressed>` "Motion: On/Off", persisted in localStorage; Off = `still` mode | Keyboard + screen reader; state persists across routes |
| Contrast over moving light | Reading scrim, density falloff, and luminance cap behind text | `spatial.contrast.spec.ts` samples the canvas behind every text block: ≥ 4.5:1 body, ≥ 3:1 large |
| Keyboard parity | Focus-visible triggers the same scene highlight as hover; Tab order unchanged; skip link added to the homepage | Keyboard walkthrough on all routes |
| Typed tagline | Wrapper `aria-hidden="true"` plus a visually-hidden static list of all `TAGLINES` (no content loss, no 60 ms announcements) | Screen reader check (VoiceOver + NVDA) |
| No seizure risk | No flashing > 3 Hz; pulses ≥ 1.5 s period; streak bursts are luminance-capped | Visual review + PEAT-style frame check on recorded video (manual) |
| Zoom / reflow | Canvas independent of text zoom; 200 % zoom and 320 px reflow unchanged | Existing viewport matrix |
| Vestibular | Max angular velocity ≤ 25°/s (crane), ≤ 3° roll, no oscillating motion | Camera telemetry in debug overlay, unit test on station data |

## 6. Compatibility test matrix

| Browser / device | Tier expected | Must verify |
|---|---|---|
| Chrome stable, Windows, Iris Xe | 3 | Full storyboard, p95 frame time, bloom |
| Chrome stable, Windows, discrete GPU, 144 Hz | 3 | High-refresh pacing, damping feel |
| Edge stable | 3 | Smoke |
| Firefox stable, Windows | 3 | Shader compile, fwidth, additive blending |
| Safari macOS (M-series) | 3 | Low Power Mode 30 fps behavior, bloom cost |
| iOS Safari 17/18/26 (iPhone 12–15) | 2 | Address-bar resize, memory, thermal, touch-scroll smoothness |
| Chrome Android (Pixel 6a, Galaxy A54) | 2 | Fill rate, adaptive downgrade, back/forward cache |
| WebGL disabled (Chrome flag) | 1 | CSS fallback identical to today |
| `prefers-reduced-motion` on every platform | still | No camera motion; all content visible |
| JS disabled | 0 | Content still renders? (**No.** The site is CSR today; unchanged, documented) |

Limitation recorded honestly: this research session had a single Chromium-based desktop pane available. Real-device performance, Safari/iOS behavior and screen-reader output were **not** verified and are gated in [10](10-acceptance-criteria.md).
