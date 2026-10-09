# 07 — Validation and release evidence

Research date: 2026-10-09. Source baseline: pvparekh/portfolio@01e6f9510952776fcf1a39266270b686a5c224a4 (feat/solutions-client-acquisition). This research branch is independent of production main. Method: GitHub/Vercel API inspection plus public websites through text/structure browsing; live rendered portfolio and animation/device interactions were NOT visually inspected.

## Completed verification (source/connector only)
- [x] Authenticated repo ownership and permissions, branch state and active draft PR verified through GitHub.
- [x] Source tree and package versions inspected for active feature branch.
- [x] src/App.tsx EXPERIENCE block extracted verbatim to protected baseline doc.
- [x] App projects and Experience JSX inspected. Three equal project cards and existing multi-role timeline confirmed from code.
- [x] src/main.tsx route/history implementation and SiteNav hover/keyboard code inspected.
- [x] Vercel deployment dpl_AkEmLGxFKMJZsihdzbGN7UfV3d4h reports READY for 01e6f951; build artifact is not a browser test.
- [x] F1 engineering overview and repository README, Review Bot README, AetherFlow README examined.
- [x] 27 different external reference URLs opened in text/structure mode; 17 technical/UX primary docs opened.
- [x] Mathematical color comparison: --text-3 #4B5563 vs #08080D ≈ 2.64:1, #6B7280 vs #0D0D15 ≈ 4.00:1. Not a page-wide audit.

## Explicitly NOT verified
- [ ] Production or preview screenshots: site unavailable through current web tool; visual comparison pending.
- [ ] Real hover/touch and keyboard interaction: no graphical browser session succeeded.
- [ ] Responsive behavior, accessibility audit, contrast in the rendered page, screen reader, all links.
- [ ] LCP / INP / CLS or Lighthouse scores: no measurement run.
- [ ] Local npm build/test: no local repository+dependencies available in current runtime.
- [ ] New deployed website appearance and complete stage 1–6 acceptance criteria.

## Regression matrix to run in browser
| Area | Scenarios | Result |
|---|---|---|
| Routing | direct /, direct /solutions, cross-route anchor, refresh, history back/forward | not run |
| Shared nav | mouse dropdown entry/exit, outside click, Escape, Tab, mobile expansion | not run |
| Content integrity | every company, role, date, URL, bullet against baseline, both layouts | source baseline captured, rendered not run |
| Project links | three GitHub URLs, live demos, source claims, media fallback | not run |
| Accessibility | text/target contrast, focus visible, reflow at 200%, reduced motion | not run |
| Performance | Lighthouse device profiles, LCP, INP, CLS, animation profiling | not run |

## Release status
**Research package only.** Production untouched; no visual implementation or release claimed. Next gate is browser access, screenshot capture and claim validation, then Stage 1 changes on this feature branch. No approval to merge/promote.
