# 00 — Project charter

Research date: 2026-10-09. Source baseline: pvparekh/portfolio@01e6f9510952776fcf1a39266270b686a5c224a4 (feat/solutions-client-acquisition). This research branch is independent of production main. Method: GitHub/Vercel API inspection plus public websites through text/structure browsing; live rendered portfolio and animation/device interactions were NOT visually inspected.

## North star
Transform the existing premium charcoal/amber engineering portfolio into a recognizably original, technical-evidence-rich experience that gets the owner considered for software/data engineering interviews. An independently useful consulting pathway remains at /solutions. Never trade credibility or accessibility for aesthetic spectacle.

## Audiences and success journeys
- Recruiter (15 seconds): professional identity, current role, prominent projects, links, contact.
- Hiring manager (2 minutes): progression, production responsibilities, technical specialization, relevant proof.
- Senior engineer (5 minutes): inspect decisions, architecture, code, tests, constraints, provenance.
- Potential client (/solutions): practical problems solved, credible approach, contact.
- Mobile visitor: same information without relying on hover.

## Verified repository state
- Production main: cae8484e30e0fd4d456262dd8a3990ca223fd964. Preview feature baseline: 01e6f9510952776fcf1a39266270b686a5c224a4, 60 commits ahead of main as inspected.
- Draft PR #2 introduces shared SiteNav, a standalone /solutions route, history-based routing, and cross-route section anchors. Latest inspected Vercel preview deployment dpl_AkEmLGxFKMJZsihdzbGN7UfV3d4h reports READY; rendered QA not established.
- React 19, TS 6, Vite 8, Tailwind 4, Framer Motion 12, Lucide. Relevant files: src/App.tsx (1313 lines), src/SiteNav.tsx (401 lines), src/main.tsx, src/style.css, src/SolutionsPage.tsx, src/solutions.css, src/solutionsData.ts.
- Site navigation is a persistent component in main.tsx. Browser history and hash scroll are handled explicitly. Vercel rewrite serves /solutions/index.html.

## Inviolable controls
1. Preserve EXPERIENCE data (companies, role dates, locations, URLs and every professional bullet) verbatim. See 08-protected-experience-baseline.md and the upstream App.tsx blob 4f455e3278c53d4911c9b805826e212bd13f221b.
2. Do not disclose proprietary employer materials. Employer work ≠ independently owned portfolio project.
3. No unsupported throughput, reliability, savings, user count, production-readiness, or model claims.
4. Never push to main, merge, promote to production, or change deployment protection without express authorization. Research branch is based on existing preview feature.
5. Preserve the existing professional amber/charcoal identity; / prioritizes recruiting, /solutions client acquisition.
6. Maintain rollback via immutable base SHA, PR diff and independent preview branch.

## Scope
Research foundation, semantic/token/interaction design system, hiring-first layout, career progression visualization, differentiated evidence-based project narratives, measured motion, responsible media architecture, accessibility/performance verification, prepared (not necessarily built) future /projects route.

## Not in scope / dependencies
No fabricated screens, employer-sensitive technical diagrams, copied third-party graphics, unsupported user testimonials, large new frameworks, compulsory 3D, or production release. Real browser visual QA is prerequisite to claiming aesthetics/accessibility/performance success.

## Risks and mitigations
- Dynamic Solutions dropdown: preserve current pointer exit suppression and test hover/touch/keyboard/back navigation.
- Protected experience descriptions: immutable baseline comparison before/after every relevant edit.
- Data Solutions regression: cross-route snapshot and behavioral tests.
- Variable quality of public projects: README/source/demo triangulation, dated evidence ledger, conservative claims.
- Excessive animation/media: no forced waits, lazy media and reduced-motion fallback.
- Unchecked visual assumptions: explicitly label unobserved interfaces; gather screenshots before layout changes.

## Exit metrics (not yet achieved)
Acceptance testing must include route integrity, zero verbatim-copy deviations, recruiter 15s and engineer 5m task scenarios, accessible navigation, mobile scanning, audited WCAG issues, actual Web Vitals, cross-device screenshots, and reviewable preview-only changes.
