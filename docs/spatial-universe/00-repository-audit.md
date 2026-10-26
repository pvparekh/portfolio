# 00 — Repository audit and rendered baseline

**Date:** 2026-10-26 · **Audited commit:** `origin/main` @ `efcc65c` ("Refine About with centered high-resolution circular portrait") · **Branch for this work:** `docs/spatial-universe-blueprint` (docs only, no source changes).

> Method: read-only source inspection of every file under `src/`, `scripts/`, config, and prior `docs/`; a local `npm run build`; live rendering of `https://parthparekh.dev` in a Chromium-based browser pane at 1440×900 and 375×812. Screenshots are in [`assets/baseline/`](assets/baseline/). Where something could not be verified it is labeled **UNVERIFIED**.

## 0. A finding first: local `main` was stale

The local checkout at `C:\Dev\PortfolioWebsite` was 6 commits behind `origin/main`. On that stale checkout `npm run build` fails at the first step: the protected-experience guard reports a mismatch because `App.tsx` says `Data Engineer I` while the baseline doc still said `Junior Data Engineer`. `origin/main` fixes this in `8c96df5` (baseline updated, salon URL bullet approved). On `origin/main` the guard passes and the build succeeds. **Every implementation branch must start from a freshly fetched `origin/main`.**

## 1. Stack, build and deployment

| Area | Verified state |
|---|---|
| Framework | React **19.2.7**, React DOM 19.2.7, `StrictMode` |
| Language | TypeScript **~6.0.2**, `strict: false`, `moduleResolution: bundler`, `noEmit` (type-check only) |
| Build | Vite **8.0.16** (`@vitejs/plugin-react` 6), multi-page `rollupOptions.input`: `index.html`, `solutions/index.html`, `software/index.html` |
| Styling | Tailwind CSS **4.3** via `@tailwindcss/vite`, plus large hand-written CSS files (`style.css` ~950 lines, `mobile.css` 1244, `solutions.css` 775, `software.css` 253, `solutionsEffects.css` 130, `deliveryProof.css` 151) |
| Animation | `framer-motion` **12.40** (letter stagger, `useScroll`/`useTransform` hero fade, `useInView` reveals, nav dropdowns); CSS keyframes; one `IntersectionObserver` hook (`useSolutionsScrollReveal`) |
| Icons | `lucide-react` 1.17 (brand icons hand-inlined because lucide v1 dropped them) |
| 3D / WebGL | **None.** No `canvas` in the DOM on any route (verified at runtime: `document.querySelectorAll('canvas').length === 0`) |
| Build script | `node scripts/check-experience-baseline.mjs && tsc && vite build` |
| Build output (origin/main) | One JS chunk `main-*.js` **443.24 kB (135.45 kB gzip)**, one CSS file **128.06 kB (24.49 kB gzip)**, three HTML entries (~1.8 kB each). No code splitting. |
| Hosting | Vercel. `vercel.json` rewrites `/solutions*` → `/solutions/index.html` and `/software*` → `/software/index.html`. One branch (`feat/software-solutions-client-experience`) has Git deployments disabled. Production domain redirects apex → `www.parthparekh.dev` (observed). |
| CI | `.github/workflows/software-solutions-validation.yml` runs only on four named feature branches + manual dispatch: `npm ci`, build, checks all three dist entries, installs Playwright 1.56 **without saving it**, runs `scripts/check-software-page.mjs` and `scripts/check-solutions-motion.mjs`, builds production main in a worktree and runs `scripts/compare-existing-routes.mjs`, uploads screenshots. |
| Tests | No unit-test runner. Browser checks are hand-rolled Node + Playwright scripts against `vite preview` on `127.0.0.1:4173` with a 10-viewport matrix (320×568 … 1920×1080). |

## 2. Routing contract (must be preserved)

`src/main.tsx` is a hand-rolled history router — there is no router library.

- `currentPage()` maps pathname → `'portfolio' | 'solutions' | 'software'`.
- `navigate(target)` pushes `/`, `/solutions`, `/software`; clicking the current page's link replaces the URL (drops the hash) and scrolls to top instantly.
- `goToSection(target, id)` smooth-scrolls in-page or pushes `/<page>#<id>` then swaps the page.
- `history.scrollRestoration = 'manual'`; `useLayoutEffect` on page change scrolls to `location.hash` element or top (`behavior: 'instant'`); `popstate` re-syncs page and hash.
- `setPageMetadata(page)` rewrites `<title>`, description, OG/Twitter tags and canonical per page.
- Each route **unmounts** the previous page component (conditional render), so per-page state is not retained.

Section IDs used by navigation (deep-link contract):

| Page | IDs in nav | Other IDs |
|---|---|---|
| Portfolio `/` | `about`, `experience`, `projects`, `skills`, `contact` | `hero`, `formula-vision-title` |
| Data Solutions `/solutions` | `services`, `work`, `approach` | `sol-main`, `problems`, `independent`, `contact`, case ids from `solutionsData.ts` |
| Software Solutions `/software` | `opportunities`, `services`, `work`, `approach`, `contact` | `sol-main`, case ids `salon`, `formula`, `review-bot`, `aetherflow`, … (used by "Related work" links) |

`SiteNav.tsx` (534 lines) is a single shared, fixed header with complex mouse-hover gating (500 ms delayed dropdown arming per destination, pointer-type checks, Escape-to-close, outside-pointer close), a mobile disclosure menu, and a scroll progress bar (`.site-reading-progress`, `scaleX: scrollYProgress`). **It contains subtle, tested behavior; the redesign must restyle it, not rewrite it.**

## 3. Homepage architecture (`src/App.tsx`, ~1210 lines on origin/main)

Single file containing data and all section components.

| Order | Component | Rendered height @1440×900 | Content summary (all must be preserved) |
|---|---|---|---|
| 1 | `HeroSection` `#hero` | 900 px | Status pill "Actively Building" + green live dot; name **PARTH / PAREKH** (letters staggered in, "PAR" amber); typed rotating tagline (`TAGLINES`: Data Engineer, Fitness Enthusiast, Motorsports Fan, AI Systems Builder, Rutgers CS Grad); sub-tagline; "P1 / GRID REF." watermark; bottom telemetry bar (ROLE, EDUCATION, STACK, FOCUS, STATUS); scroll cue chevron |
| 2 | `AboutSection` `#about` | 981 px | Circular portrait (`/IMG_2395.jpeg`), three bio paragraphs, Technical profile stats (3 / 4 / 150+), Academic profile (Rutgers, CS, DS minor), social row (GitHub, LinkedIn, Email, Resume download `/Resume_Oct_10.pdf`) |
| 3 | `ExperienceSection` `#experience` | 2432 px | **Protected** `EXPERIENCE` data: DOWC (Data Engineer I + Data Analytics Intern), Perfect Threading Salon (Software Engineer, clickable salon URL inside bullet), Marketeq Digital (Technical Business Analyst Intern); live-computed tenure strings (`formatExperienceTenure`, refreshes monthly while open) |
| 4 | `ProjectsSection` `#projects` | 1890 px | Flagship Formula Vision (3 proof points, 5-step Build/Validate/Deploy architecture, 3 links, tech strip); Review Bot and AetherFlow secondary stories with 4-step mini flows; per-project accent colors defined in `PROJECTS` (`#E8002D`, `#4ADE80`, `#8B5CF6`) but mostly unused visually |
| 5 | `SkillsSection` `#skills` | 731 px | Six "sector" cards S01–S06 with chips |
| 6 | `ContactSection` `#contact` | 942 px | "Let's build something together", "Explore Data Solutions" button, three contact links |
| 7 | `Footer` | — | © 2026 |

Total document height ≈ 7,950 px desktop, ≈ 10,800 px at 375 px wide.

### 3.1 How the existing streaks actually work (the identity to evolve)

Verified in `App.tsx` (`SPEED_LINES`) and `style.css` (`.speed-line`, `@keyframes speedLine`):

- **Six absolutely positioned `<div>`s**, each `1px` tall × `300px` wide, at fixed vertical positions `18% 33% 48% 62% 74% 86%` of the hero.
- Fill: `linear-gradient(90deg, transparent, var(--accent) 50%, transparent)` → a soft amber filament brightest in the middle.
- Animation: `translateX(-400px) scaleX(0.3)` → `translateX(110vw) scaleX(2.5)`, linear, infinite, durations **3.3–6.2 s**, staggered delays 0–2.2 s, per-line base opacity 0.22–0.55; opacity ramps 0→1 in the first 10 %, fades to 0.6 then 0 at the end. The `scaleX` growth fakes acceleration/motion-blur stretch.
- Supporting layers: `.circuit-grid` (two 1px amber lines at **2.2 % alpha every 68 px**), a radial amber glow `ellipse 70% 50% at 50% 60%` at 5 % alpha, the huge 3 %-alpha "P1" watermark.
- Reduced motion: `.speed-line { animation: none }` (lines then sit static off-screen at `left:-300px`, i.e. effectively invisible).
- Hero content fades/translates out over the first ~22–28 % of **document** scroll via Framer Motion `useScroll`.

**Visual identity extracted:** strictly horizontal, left-to-right motion; thin hairline light; warm amber on near-black; motorsport vocabulary (P1, GRID REF, telemetry, sectors S01–S06, "speed lines"); an engineering grid beneath. It is flat — all lines share one depth plane, never cross the name, never respond to the visitor. This is precisely what the spatial redesign should deepen rather than replace.

## 4. Data Solutions (`/solutions`, `src/SolutionsPage.tsx` + `solutionsData.ts` + `deliveryExamples.ts`)

Sections (heights @1440): `sol-hero` 826 · `#problems` 788 · `#services` 2702 · `#work` 2624 · `#approach` 880 · `#independent` 1873 · `#contact` 852 (≈ 10,700 px total).

- Hero: "From manual data work to *reliable systems.*", sub-copy, two CTAs, and `ArchitectureGraphic` — a 3-node DOM diagram (Disconnected sources → Reliable processing → Useful, trusted data) with Framer-animated connector traces.
- Problems (3), four service offerings with `<details>` scope disclosures, `DeliveryProof` (delivered corporate examples with Problem / What I built / Result), 5-step engagement process (Discuss, Scope, Build, Validate, Hand off), independent products (`caseStudies` filtered by `publicationApproved`, each with an expandable engineering deep dive), contact block with **copy-email** button + `aria-live` status, and a prefilled `mailto:` draft.
- Motion: CSS keyframe hero entrance ("pipeline wipe"), `useSolutionsScrollReveal` one-shot reveal classes, `MotionConfig reducedMotion="user"`.

## 5. Software Solutions (`/software`, `src/SoftwarePage.tsx` + `softwareProjects.ts`)

Sections: `sol-hero` 826 · `#opportunities` 856 · `#services` 3125 · `#work` 3694 · `#approach` 813 · `#contact` 774 (≈ 10,240 px).

- Hero: "Custom software *for your business.*" and `SoftwarePreview` — an explicitly labeled **UI concept** workspace mock (not a client screenshot; its `aria-label` says so).
- Three opportunities, **five** services each linking to related work (`#aetherflow`, `#salon`, `#review-bot`, `#formula`), five case studies with classification tags (client / independent / academic), 5-step process, contact with copy-email.
- Shares `solutions.css` with Data Solutions; `software.css` adds the workspace; `solutionsEffects.css` gives Software a lateral, scale-in motion signature distinct from Data's upward/pipeline signature.
- `scripts/check-software-page.mjs` asserts exact counts (5 services, 5 cases, no em dashes in Software main text, no Data hero diagram reuse, canonical URL, nav disclosure states). **Any redesign must keep these assertions true or update them deliberately.**

## 6. Design tokens and typography

```css
--accent:#F59E0B; --accent-dim:rgba(245,158,11,.12); --accent-border:rgba(245,158,11,.22);
--bg-0:#08080D; --bg-1:#0D0D15; --bg-2:#111119; --bg-card:#13131C;
--text-1:#F1F5F9; --text-2:#94A3B8; --text-3:#8793A3; --border:rgba(255,255,255,.06);
```

Solutions pages add `--sol-*` variables in `solutions.css`. Fonts load from Google Fonts: **Space Grotesk** 300–700 (display), **Inter** 300–600 (body), **JetBrains Mono** 400–500 (labels). The name is Space Grotesk 700 at `clamp(3.8rem, 11.5vw, 9.5rem)`, line-height 0.9.

## 7. Assets

`public/`: `IMG_2395.jpeg` (**1.26 MB**, 1114×1536 declared, served at natural width 1487 on mobile) used for the About portrait; `about-portrait.webp` (5.5 kB) exists but is **unused** in `App.tsx` on origin/main — a quick performance win to note (not to fix in this assignment). Logos: DOWC PNGs, Marketeq SVG, Perfect Threading SVG/PNG, `favicon.svg`, `icons.svg`, resume PDF. `src/assets/` holds Vite starter leftovers (`hero.png`, `vite.svg`, `typescript.svg`, `counter.ts`) — unused.

## 8. SEO, accessibility and performance (current)

- **SEO:** Pure client-side rendering; HTML entries contain only `<div id="root">` plus static `<title>`, description, canonical and OG tags per entry. Crawlers that execute JS see full content. No structured data, no OG image. All content is real DOM text, which the redesign must keep.
- **Accessibility strengths:** skip link on solutions pages; `aria-expanded`/`aria-controls` on disclosures; Escape handling; focus-visible outlines; `prefers-reduced-motion` handled across CSS and Framer; tertiary text token tuned for AA; `aria-live` copy status.
- **Accessibility gaps (observed in source):** no skip link on the homepage; decorative hero elements are not `aria-hidden`; the typed tagline mutates text every 60 ms without `aria-live="off"`/`aria-hidden` handling (screen readers may or may not announce it — **UNVERIFIED** with a screen reader).
- **Performance:** single 135 kB-gzip JS chunk; Google Fonts render-blocking stylesheet; 1.26 MB portrait; hero name is hidden behind a ~0.5–0.9 s letter stagger (LCP element starts at opacity 0). In the hidden browser pane the hero appeared blank for several seconds, but a backgrounded pane throttles animation, so **the real LCP is UNVERIFIED** and must be measured in M0.

## 9. Rendered observations (screenshots in `assets/baseline/`)

| File | Observation |
|---|---|
| `home-hero-1440.jpg` | Centered two-line name dominates; streaks read as faint thin dashes at left/right; the grid is barely perceptible; telemetry strip anchors the bottom; generous negative space. Strong, but flat. |
| `home-experience-1440.jpg` | Editorial headings centered, DOWC timeline with logo tile and "CURRENT" marker; text-heavy by design (protected copy). |
| `home-projects-1440.jpg` | Flagship Formula Vision bordered panel with architecture rail. |
| `solutions-hero-1440.jpg` / `software-hero-1440.jpg` | Split hero: left copy, right bordered diagram / UI concept. Both pages share a near-identical grid and type system; differentiation is mostly in the right-hand illustration. |
| `home-hero-375.jpg` | Name fits in two lines, telemetry reflowed into a 2×2 grid + status row, no horizontal overflow (verified `scrollWidth <= innerWidth`). |

## 10. Behaviors that must be preserved (contract for every milestone)

1. All copy, links, CTAs, downloads, `mailto:` drafts, copy-email behavior, `<details>` disclosures and their text.
2. `EXPERIENCE` block byte-identical to `docs/portfolio-renaissance/08-protected-experience-baseline.md` (build guard).
3. Routes `/`, `/solutions`, `/software`, direct loads, refresh, back/forward, hash deep links, `scrollRestoration = 'manual'` logic, per-page metadata and canonicals.
4. `SiteNav` hover gating, keyboard (Escape, Tab order), touch disclosure menu, reading-progress bar.
5. Assertions in `scripts/check-software-page.mjs`, `check-solutions-motion.mjs`, `compare-existing-routes.mjs` (update only deliberately, with justification).
6. No horizontal overflow at 320 px; 44 px touch targets; reduced-motion keeps all content visible.
7. Live tenure calculation; resume filename `Parth_Parekh_Resume.pdf`.
8. Software page: no em dashes in main text; UI-concept disclaimer; "client / independent / academic" classification visible.

## 11. Existing documentation to respect

`docs/portfolio-renaissance/*` (Oct 9–11) already established: evidence-before-effects, recruiter 15-second clarity, "no compulsory 3D", protected experience copy, conservative claims, and the rule that build success ≠ visual QA. This blueprint deliberately **adds** an immersive layer while keeping those principles as hard constraints: 3D is a progressive enhancement over a complete, readable DOM site.
