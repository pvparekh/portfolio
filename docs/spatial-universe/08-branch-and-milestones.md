# 08 — Development branch strategy and milestones

## Repository facts that shape the plan

- Remote: `github.com/pvparekh/portfolio`. Production = `main` deployed by Vercel.
- Existing remote branches follow `feat/…`, `fix/…`, plus `projects-editorial-redesign`. Prior large initiatives used one research branch plus Draft PRs to preview branches (see `docs/portfolio-renaissance/06-decision-ledger.md`).
- `vercel.json` can disable deployments per branch (`git.deploymentEnabled`).
- CI workflow triggers are hard-coded to specific branch names, so new branches must be **added to the trigger list** to get CI.
- Local `main` was found 6 commits behind `origin/main`: always `git fetch` first.

## Branch model

```
origin/main  (production, untouched)
  └── feat/spatial-universe                 integration branch (Vercel preview)
        ├── feat/spatial-m00-baseline       ─┐
        ├── feat/spatial-m01-engine          │ one branch per milestone,
        ├── feat/spatial-m02-hero            │ PR → feat/spatial-universe,
        ├── …                                │ squash or merge commit, reviewed
        └── feat/spatial-m10-release        ─┘
docs/spatial-universe-blueprint             this research deliverable (docs only)
```

Rules:
1. Branch every milestone from the **latest** `feat/spatial-universe` (rebase or merge `origin/main` into the integration branch at each milestone start, so production content edits such as the recent portrait and tagline changes flow in).
2. Each milestone PR targets `feat/spatial-universe`, **never `main`**.
3. Production code paths stay behind `VITE_SPATIAL` (default `off`) until M10, so the integration branch can be merged to `main` later with the flag off if desired, which keeps rollback trivial.
4. **Merging into `main`, enabling the flag in production, or changing Vercel production settings requires explicit written authorization from the owner.**
5. Every PR includes: screenshots/recordings (desktop + mobile), the milestone's test output, a perf sample if rendering changed, and a preservation checklist.

## Milestones

| # | Milestone | Outcome (independently reviewable) | Exit gate |
|---|---|---|---|
| **M0** | Baseline preservation | Integration branch; Playwright saved as a dev dependency; CI triggers for `feat/spatial-*`; DOM-text snapshot of all three routes; visual baselines; perf/LCP baseline of production; `VITE_SPATIAL` flag plumbing (no visuals) | Existing checks green; baselines committed; zero visual diff vs production |
| **M1** | Core spatial engine | `core/` (store, capability, anchors, scrollMap with unit tests), `SpatialMount` lazy loading, `SpatialCanvas` with context-loss handling, debug overlay, Motion toggle (functional), empty world with the grid floor | Tier detection matrix passes; scene chunk lazy; initial bundle ≤ 145 kB gzip; context loss recovers; reduced motion → still |
| **M2** | Homepage hero transformation | `FilamentField` (free flow + velocity), hero station, WebGL name twin, "name opens" transit, CSS→canvas handoff | Hero matches storyboard S0 in side-by-side review; LCP not regressed; p95 frame time measured on reference desktop |
| **M3** | Homepage destinations and transitions | Stations and formations S1–S5, scroll map with plateaus, reading scrim, hover/focus highlights, transparent sections when ready | Determinism test passes; contrast spec passes; anti-goals checklist signed |
| **M4** | Route transitions + shared canvas | Persistent canvas across routes, fork transitions, deep-link cuts, back/forward | All routing behaviors in 00 §10 pass; no GPU memory growth across 20 route swaps |
| **M5** | Data Solutions "Confluence" | World + stations for all Data sections | Existing `check-solutions-motion` and route compare green; storyboard review |
| **M6** | Software Solutions "Assembly" | World + stations for all Software sections | `check-software-page` assertions green (5 services, 5 cases, no em dash, UI concept label) |
| **M7** | Responsive adaptation | Tier 2 tuning, portrait compositions, address-bar handling, real-device pass | Mobile budgets measured on ≥ 2 real devices; no horizontal overflow at 320 px |
| **M8** | Accessibility | Reduced motion, Motion toggle polish, skip link, tagline a11y, focus parity, axe clean | axe 0 serious/critical; VoiceOver + NVDA walkthrough notes; keyboard-only run |
| **M9** | Performance optimization | Known-path culling, warm-up, bloom tuning, bundle guard, adaptive thresholds | All budgets in 07 measured and reported (pass/fail table) |
| **M10** | Visual refinement + production verification | Art-direction polish passes, poster/OG generation, cross-browser matrix, release notes, rollback rehearsal | Owner review; **stop and request authorization** before any merge to `main` |
