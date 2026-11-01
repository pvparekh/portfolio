# Spatial Universe: research and implementation blueprint

**Status:** research and planning complete (2026-10-26). **No application source code was changed.** Branch: `docs/spatial-universe-blueprint` (from `origin/main` @ `efcc65c`).

## The recommendation in one paragraph

Evolve the homepage's six amber speed lines into **SLIPSTREAM**: a real-time WebGL world of thousands of amber filaments at many depths, travelled through by a camera whose position is a pure function of native scroll. Each portfolio section is a *sector* where the stream slows and organizes around real content: the name opens like a gate, a halo for About, one gate per role along an Experience straight, three tinted systems for Projects, an overhead "lap" for Skills, and a horizon for Contact. Data Solutions becomes **Confluence** (chaos → validated, ordered lanes) and Software Solutions becomes **Assembly** (edges snapping into modules). DOM content stays the readable, accessible, SEO source of truth; the canvas is lazy-loaded, decorative, tiered (full / lite / CSS / static), pausable, and fully replaced by today's site on any failure.

## Documents

| # | Document | Deliverable |
|---|---|---|
| 00 | [Repository audit and rendered baseline](00-repository-audit.md) | 1. Existing repository audit |
| 01 | [Research dossier](01-research-dossier.md) | 2. Research dossier with references and sources |
| 02 | [Creative directions](02-creative-directions.md) | 3. Three creative directions with tradeoffs |
| 03 | [Art direction: Slipstream](03-art-direction.md) | 4. Recommended final art direction |
| 04 | [Homepage storyboard](04-storyboard.md) | 5. Scene-by-scene storyboard |
| 05 | [Data and Software Solutions](05-solutions-pages.md) | 6. Homepage, Data Solutions, Software Solutions designs |
| 06 | [Technical architecture](06-technical-architecture.md) | 7. Technical architecture and rendering strategy |
| 07 | [Performance, accessibility, compatibility](07-performance-accessibility-compat.md) | 8. Performance, accessibility and compatibility strategy |
| 08 | [Branches and milestones](08-branch-and-milestones.md) | 9. Development branch and milestone plan |
| 09 | [Prompt bank](09-prompt-bank.md) | 10. Implementation prompt bank (P00–P14) |
| 10 | [Acceptance criteria](10-acceptance-criteria.md) | 11. Acceptance criteria and verification plan |
| 11 | [Implementation log](11-implementation-log.md) | V1 desktop build: what shipped, deviations, measurements, review notes |
| 12 | [V2 implementation](12-v2-implementation.md) | V2 destination journey: diagnosis, architecture, worlds, exhibits, validation, measurements, limitations |
| 13 | [Scroll feel, interaction and life](13-scroll-feel-and-life.md) | Scroll-feel targets and before/after measurements, exhibit hover and inspect, ambient life, grouped experience |
| 14 | [Smoothness root causes](14-smoothness-root-causes.md) | What caused jitter, freezes and hitches, the fixes, and the scroll QA suite that guards them |
| 16 | [Backdrops, composition and life](16-backdrops-and-composition.md) | A unique procedural backdrop per destination at a quarter of the cost, Projects as one designed exhibition, a living About planet, framing on every screen size |

Visual overview (live filament sketch + illustrated storyboard frames): [`slipstream-blueprint.html`](slipstream-blueprint.html), also published privately at https://claude.ai/artifact/6pzPXFFHjqSWGZGrqWaFQ8.

Assets: [`assets/baseline/`](assets/baseline/) (live-site screenshots, 2026-10-26), [`assets/diagrams/camera-path.svg`](assets/diagrams/camera-path.svg).

## Key findings worth knowing before implementation

1. **Local `main` was 6 commits behind `origin/main`;** on the stale copy the protected-experience build guard fails. Always fetch first.
2. The streaks are six CSS `div`s (1×300 px amber gradients, `translateX` + `scaleX(0.3→2.5)`, 3.3–6.2 s). There is **no WebGL anywhere today**, and the JS is a single 135 kB-gzip chunk.
3. Version facts that constrain the stack: three r186 must be pinned below 0.187 for `postprocessing`; R3F v10 (WebGPU-first) is alpha; GSAP is fully free but unnecessary here; troika SDF text can't read woff2; an always-animating background needs a **pause control** (WCAG 2.2.2).
4. The About portrait ships a 1.26 MB JPEG while a 5 kB WebP sits unused, an easy win independent of this project.

## How to proceed

Run [09-prompt-bank.md](09-prompt-bank.md) prompts in order (P00 → P14), one milestone branch each, PRs into `feat/spatial-universe`. Nothing merges to `main` without explicit authorization.
