# 01 — Research dossier

Researched 2026-10-26. **V** = verified, with a source (case study, official docs, or a bundle inspection: live HTML/JS fetched and searched for library signatures). **I** = inferred from visuals or general knowledge. Unverified items are named as such. Sources are at the end.

## A. Reference analysis

Each entry answers: what is exceptional · scale/depth · camera · scroll · transitions · typography/content · rendering · verified implementation · perf/mobile · **what we take**.

### A1. Igloo Inc (igloo.inc), Abeto. The closest overall analogue
- **Exceptional:** procedurally grown ice blocks per project; particles that glow with speed and re-form on link selection; frost and chromatic-aberration grade. **V** (Awwwards case study)
- **Depth:** small hero objects in a vast dark void; fog and particles carry the depth. **I**
- **Camera / scroll:** one continuous flight, storyboarded down to "the camera's journey to the particles in the footer". **V**. Scroll drives the camera through three sections. The bundle contains GSAP + ScrollTrigger and wheel/touchmove handlers. **V** (bundle)
- **Transitions:** chromatic aberration, "tech displacement" and frost mixed in post-processing. **V**
- **Typography:** UI drawn in WebGL; text scramble by offsetting into an SDF texture (no DOM reflow); IBM Plex Mono. **V**
- **Rendering:** three.js WebGLRenderer (r165 string), Svelte + Vite, bloom via EffectComposer, KTX2/Basis, Draco/Meshopt, VDB volumes through a custom exporter. 3D chunk ≈ 1.5 MB. **V**
- **Perf:** continuously profiled on low-end devices; background shader compilation; real-time intro instead of video to save bytes. **V**
- **Take:** one coherent glowing material plus one continuous take. **Reject:** WebGL-only UI text (accessibility), the 1.5 MB 3D payload.

### A2. Lusion (lusion.co), SOTY 2023
- **Exceptional:** tactile, softly lit objects, reactive cursor, and a content-first hero (plain text plus "scroll to explore"). **V** (page text)
- **Depth / camera:** objects overlap HTML layers; gentle scroll-coupled camera, not a long flight. **I**
- **Rendering:** Astro + three.js (ShaderMaterial-heavy, InstancedMesh, early WebGPU/TSL references). **V** (bundle)
- **Mobile:** the stated aim was usability on mobile. **V** (awards entry snippet only)
- **Take:** **real HTML stays the readable layer**; WebGL lives behind and around it.

### A3. Joseph Santamaria (joseph-san.com). A solo developer at a comparable scale
- **Exceptional:** architectural scenes lit like "an early morning underwater city"; each section is a composed scene. **V** (Codrops, Apr 2026)
- **Camera / scroll:** scroll maps to camera, object and reveal timing; GSAP Observer unifies wheel, touch and trackpad; ScrollTrigger makes the site "feel like a single camera take"; snap-to-scene needed heavy threshold, velocity and easing tuning. **V**
- **Transitions:** opening a project unfolds a tesseract, and audio low-passes so projects feel like rooms. **V**
- **Typography:** GSAP SplitText over the canvas (HTML). **V**
- **Perf:** KTX2, Draco, instancing; atmosphere rendered to a low-res target and composited; **culling driven by the known camera path** instead of LOD tiers; self-reported 144 fps on strong hardware. **V** (self-report)
- **Take:** known-path culling, low-res atmosphere, HTML text over canvas. **Reject:** snap-to-scene. Our sections hold long protected text (Experience is 2,400 px), and snapping fights reading, find-in-page and keyboard scrolling. Recruiters must be able to scroll normally.

### A4. The Monolith Project (themonolithproject.net). Same stack as ours (R3F)
- **Exceptional:** 13 stylised scenes from 2D art, with coloured outlines. **V** (Codrops, Nov 2025)
- **Transitions:** render A and B, then mix on a full-screen triangle by progress through masks (grayscale, zoom blur, radial, raymarched sphere, runtime-generated wipes). **V**
- **Rendering:** R3F; deferred MRT G-buffer; depth/normal edge outlines; composable JSX material and particle modules. **V**
- **Take:** a single **progress-driven transition system** for route changes (Portfolio ↔ Data ↔ Software). Composable, typed scene modules.

### A5. Active Theory (activetheory.net)
- **Exceptional (v4, SOTM Jan 2018):** an endless flight through five repeating alley modules; scene color tinted by the average color of the current video. **V** (Awwwards)
- **Rendering:** proprietary Hydra framework (not three.js) with WebGL text (GLText), GPU particles, an in-house scene editor, ScrollController / scrollInertia. **V** (bundle)
- **Take:** **repeating modules make infinity cheap** (our filament field wraps around the camera); **tint the world from the content in view** (project accent tints in S3).

### A6. Apple product pages (AirPods Pro, current)
- **Technique today:** pinned `<video>` scrubbed by scroll keyframes, with per-breakpoint keyframes and masks, start/end JPG posters, `preload="none"`, lazy loading within about ±150vh. **V** (HTML inspection). The famous canvas image sequence (2019) is verified only through third-party recreations.
- **Pacing:** pinned sticky sections; text appears on keyframes while the visual holds. **V/I**
- **Perf:** no GPU risk, but heavy bandwidth and no interactivity. **I**
- **Take:** **dwell vs transit pacing**, per-breakpoint scroll ranges, always a poster frame, lazy media. **Reject:** prerendered video as the primary medium (fluid content heights, interactivity; see [06 §1](06-technical-architecture.md#1-rendering-architecture-decision)).

### A7. Resn: Pioneer "Corn. Revolutionized." (SOTM Jul 2020)
- One continuous vertical scroll through the seed's development. **V**
- In-house Jelly pipeline on three.js + GSAP; **depth of field faked by a focal-point uniform** driving particle size, fade and blur; MSDF headlines; **`fwidth` keeps lines 1px across screens**; a single bloom+noise pass; per-device assets. **V**
- **Take:** focal-uniform fake DoF for near filaments, and `fwidth`-based hairlines so the original 1px line survives in 3D at any DPR.

### A8. Media.Monks: Getty "Persepolis Reimagined" (Developer SOTY 2022)
- A fixed-path camera flight; the fixed path let them choose which objects to reflect (no second full render). An intro video chroma-keyed and grade-matched to real time. **One post stack across all states** for continuity. Unity-authored, exported JSON, WebGL2, instancing, frustum culling, LOD, Vue + GSAP. **V**
- **Take:** **the known path is an optimisation guarantee**, and **identical post-processing everywhere** is the visual glue.

### A9. Immersive Garden (own site, 2025)
- A bas-relief 3D composition; 3D Roman numerals anchor menu sections. three.js + Nuxt + GSAP + **Lenis** + Strapi; server-side KTX, channel-packed textures, gltf-transform and Blender scripts. **V** (Awwwards case study)
- **Take:** large numeric sector markers as spatial anchors (our S0–S5 / 01–05 indices).

### A10. Bruno Simon (bruno-simon.com, 2025–26)
- A drivable toy island with no scroll (keyboard, touch, gamepad). three.js r183 **WebGPURenderer + TSL** with automatic WebGPU; Rapier physics; palette-texture coloring; ~78k single-triangle grass blades; instancing and merging; a low preset disables blur and DoF and lowers shadow resolution; MIT source. **V**
- **Take:** one-triangle-per-element instancing (our filaments are 2-triangle quads), palette discipline, quality presets. **Reject:** game-style navigation (wrong for a recruiter audience).

### A11. Codrops "High-speed Light Trails" (Daniel Velasquez, 2019). The technical blueprint for our streaks
- Thousands of instanced tube lights looping forever, frame-rate-independent; a modular GLSL distortion takes a 0–1 road progress (with a JS port so the camera can follow the curve); fog fades the far lights. **V**
- **Take:** the core of `FilamentField`. Instanced quads, wrap-around offsets, distortion along the path, fog falloff, with two key differences: **scroll-coupled travel instead of autoplay speed**, and **formations** that lock filaments into sector structures.

### A12. GitHub globe (2020) and Stripe globe
- GitHub: ~12k instanced dots, Bézier arcs via `setDrawRange`, antialiasing off with a halo shader, an SVG placeholder crossfading to the canvas, and **adaptive quality: below 55.5 fps over 50 frames → step down 4 tiers** (DPR cap 1.5, fewer arcs and dots). **V**
- Stripe: ~60k dots on a sunflower spiral masked to ~20k, Bézier arcs over 2.5 s, other animations paused during scroll, static image fallback. **V**
- **Take:** the measured-FPS tier stepping and the placeholder-then-crossfade loading. The Data Solutions packets and lanes vocabulary.

### A13. Smart.com relaunch (Demodern), automotive
- A WebGL configurator whose camera system uses "cinematic tracking shots" between named focus points with the car centred. **V** (Webby entry). No verified Porsche WebGL case study was found (Lusion's Porsche "Dream Machine" is CG film).
- **Take:** **named camera "shots"** eased between: our `Station` type.

### Not verified
UNIT9 (no technical case study found; its site is Next.js). Linear, Vercel Ship, Shopify Editions and Prometheus Fuels were not researched in this pass.

## B. Technology fact sheet (2026-10-26)

| Topic | Fact | Source |
|---|---|---|
| three.js | Latest **r186** (`three@0.186.1`). `WebGPURenderer` falls back to WebGL2 automatically, but **`ShaderMaterial`/`onBeforeCompile`/`EffectComposer` don't work under it** (must port to TSL). No official "production-ready" label. Whole package ≈ 180 kB min+gzip (tree-shaken core smaller, unmeasured). | github.com/mrdoob/three.js/releases, threejs.org manual, bundlephobia |
| R3F | **9.8.2** stable, peer `react >=19 <19.4`. 9.8 adds React 19.3 support and StrictMode Canvas fixes. **v10 is alpha** and makes WebGPU the default (GLSL path moves to `/legacy`). | npm, GitHub releases |
| drei | **10.7.9** (`Text` = troika, `PerformanceMonitor`, `AdaptiveDpr`, `View`, `ScrollControls`). `ScrollControls` replaces page scroll with its own container, which is a poor fit for a native-scroll multi-page site. | drei docs |
| postprocessing | **6.39.5**, peer **`three >=0.168 <0.187`**, so pin three 0.186.x. `@react-three/postprocessing` 3.2.2. | npm |
| GSAP | 3.15.0; **all plugins free since 3.13** (incl. SplitText). `normalizeScroll` is experimental, moves scrolling to JS, and hides native scrollbars. (Licence fine print not rendered, so unverified.) | gsap.com/blog/3-13 |
| Lenis | 1.3.27; `respectReducedMotion` defaults to true; anchors need an option; Safari capped at 60 fps (30 in low power). | GitHub README |
| Motion | The `motion` package is now 14.6; the repo's `framer-motion` 12.40 still works, and no migration is needed for this project. `useScroll` can use native ScrollTimeline for DOM animation; reading it in a WebGL loop is plain JS. | npm, motion.dev |
| CSS scroll-driven animations | Chrome/Edge 115+, Safari/iOS 26+, Firefox 159+ (release notes pending) ≈ 88 % global. Useful for DOM-only reveals in tier 1. | caniuse, webkit.org |
| WebGPU | Chrome/Edge 113+, Safari 26 (macOS partial, iOS supported), Firefox default on Windows (141) and Apple Silicon (147). **The WebGL2 path is still required.** | caniuse, webkit.org, Firefox notes |
| Context loss | `webglcontextlost` → `preventDefault()` to allow restore; rebuild on `webglcontextrestored`; three `forceContextLoss()` simulates it for tests. iOS canvas memory caps reported at 224–576 MB depending on version (iOS 26 unverified). | MDN, Khronos spec, WebKit bugs |
| SDF text | troika generates SDF in a worker; **cannot read `.woff2`** (use ttf/otf/woff); `sdfGlyphSize` power of 2; drei `<Text>` suspends, so pass `characters`. | troika README, drei docs |
| Assets | gltf-transform CLI 4.5.1; `KTX2Loader.detectSupport(renderer)` before loading. | gltf-transform.dev, threejs docs |
| Perf tools | stats-gl (GPU timer queries), r3f-perf (`PerfHeadless` for tests), Long Animation Frames API (Chromium 123+). **`<canvas>` is not an LCP candidate**, so the DOM hero text is the LCP element. INP excludes scroll, but heavy frame work still blocks input. | GitHub, web.dev |
| WCAG 2.2 | **2.3.3 (AAA):** scroll-linked motion must be disable-able → `prefers-reduced-motion`. **2.2.2 (A):** auto-moving content >5 s alongside other content needs **pause/stop/hide**, so an always-animating background requires a **pause control**. | w3.org/WAI |
| Playwright | `@playwright/test` 1.64.1; `animations:"disabled"` does **not** stop rAF/canvas, so pause the loop yourself; SwiftShader via `--use-angle=swiftshader`; assert the renderer before capturing; baselines are platform-specific. | playwright.dev |

## C. Transferable principles (ranked for this portfolio)

1. **Scroll is travel along a fixed, authored path, and the path is the optimisation contract.** (Igloo, Persepolis, Santamaria) → `Station[]` + Catmull-Rom; culling and density by path segment.
2. **Evolve the speed lines into instanced light trails in depth, coupled to scroll velocity, with 1px hairlines preserved via `fwidth`.** (Codrops trails, Resn) → `FilamentField`.
3. **Readable content stays HTML; WebGL text only for the hero name.** (Lusion, Santamaria, Apple) → DOM-first with a WebGL twin for the name.
4. **Dwell vs transit pacing.** (Apple) → plateaus in `scrollMap`; no motion during reading.
5. **Measured adaptive quality tiers.** (GitHub, Bruno, Santamaria) → `PerformanceMonitor` thresholds and a 4-tier system.
6. **One transition system, one post stack, everywhere.** (Monolith, Persepolis) → route transitions as progress-driven mixes; identical tone mapping and bloom on all routes.
7. **Fake expensive optics.** (Resn) → focal-uniform fake DoF on near filaments; no real DoF pass.
8. **Repeating modules and wrap-around fields for cheap infinity.** (Active Theory, Codrops) → filaments wrap around the camera.
9. **Tint the world from the content in view.** (Active Theory) → project accents in S3; validated cyan in Confluence.
10. **Placeholder first, crossfade to canvas; static fallback that exposes everything.** (GitHub, Apple, Stripe) → CSS streaks and poster as tiers 1/0.

**Deliberate divergences from the references:** no scroll snapping or Observer hijack (long protected text, recruiter scanning); no Lenis by default (accessibility, Safari caps); no GSAP (one animation system for DOM is enough, and the camera is pure math); no WebGPU-first (R3F v10 alpha, postprocessing incompatibility).

## Sources

References: [Igloo case study](https://www.awwwards.com/igloo-inc-case-study.html) · [Igloo three.js forum](https://discourse.threejs.org/t/landing-site-igloo-inc/67249) · [lusion.co](https://lusion.co) · [Lusion on Awwwards](https://www.awwwards.com/lusion/) · [Lusion v3 inspiration](https://www.awwwards.com/inspiration/home-page-lusion-v3) · [Codrops: Lusion (Apr 2026)](https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/) · [Santamaria on Codrops](https://tympanus.net/codrops/?p=114641) · [Santamaria on Awwwards](https://www.awwwards.com/sites/joseph-santamaria-26) · [Building The Monolith (Codrops)](https://tympanus.net/codrops/2025/11/29/building-the-monolith-composable-rendering-systems-for-a-13-scene-webgl-epic/) · [Active Theory v4 SOTM](https://www.awwwards.com/active-theory-v4-wins-january-2018-site-of-the-month.html) · [apple.com/airpods-pro](https://www.apple.com/airpods-pro/) · [CSS-Tricks image sequence](https://css-tricks.com/?p=308477) · [Resn Pioneer SOTM](https://awwwards.com/resns-pioneer-corn-revolutionized-wins-site-of-the-month-july-2020.html) · [Persepolis case study](https://awwwards.com/case-study-getty-persepolis-reimagined.html) · [Immersive Garden case study](https://www.awwwards.com/case-study-immersive-gardens-new-website.html) · [Bruno Simon case study](https://www.awwwards.com/brunos-portfolio-case-study.html) · [Pastel interview](https://usepastel.com/blog/how-a-design-portfolio-got-the-attention-of-400-000-visitors) · [Smart Webby entry](https://webbyawards.com/crafted-with-code/smart) · [High-speed Light Trails (Codrops)](https://tympanus.net/codrops/2019/11/13/high-speed-light-trails-in-three-js/) · [How we built the GitHub globe](https://github.blog/engineering/how-we-built-the-github-globe) · [Stripe globe](https://stripe.com/blog/globe)

Technology: [three.js releases](https://github.com/mrdoob/three.js/releases) · [WebGPURenderer docs](https://threejs.org/docs/pages/WebGPURenderer.html) · [R3F releases](https://github.com/pmndrs/react-three-fiber/releases) · [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) · [drei View](https://drei.docs.pmnd.rs/portals/view) · [drei ScrollControls](https://drei.docs.pmnd.rs/controls/scroll-controls) · [postprocessing on npm](https://registry.npmjs.org/postprocessing/latest) · [GSAP 3.13](https://gsap.com/blog/3-13/) · [normalizeScroll](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()) · [Lenis](https://github.com/darkroomengineering/lenis) · [motion useScroll](https://motion.dev/docs/react-use-scroll) · [caniuse scroll timeline](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) · [caniuse WebGPU](https://caniuse.com/webgpu) · [Safari 26 features](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/) · [MDN webglcontextlost](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event) · [WebKit canvas memory bug](https://bugs.webkit.org/show_bug.cgi?id=195325) · [troika-three-text](https://github.com/protectwise/troika/tree/main/packages/troika-three-text) · [gltf-transform CLI](https://gltf-transform.dev/cli) · [stats-gl](https://github.com/RenaudRohlinger/stats-gl) · [r3f-perf](https://github.com/utsuboco/r3f-perf) · [Long Animation Frames](https://developer.chrome.com/docs/web-platform/long-animation-frames) · [LCP](https://web.dev/articles/lcp) · [INP](https://web.dev/articles/inp) · [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) · [Playwright assertions](https://playwright.dev/docs/api/class-pageassertions) · [Playwright snapshots](https://playwright.dev/docs/test-snapshots)
