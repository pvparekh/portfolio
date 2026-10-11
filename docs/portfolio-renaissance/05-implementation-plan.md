# 05 — Six-stage implementation roadmap

Research date: 2026-10-09. Source baseline: pvparekh/portfolio@01e6f9510952776fcf1a39266270b686a5c224a4 (feat/solutions-client-acquisition). This research branch is independent of production main. Method: GitHub/Vercel API inspection plus public websites through text/structure browsing; live rendered portfolio and animation/device interactions were NOT visually inspected.

## Prerequisites and gate
- Preserve 08-protected-experience-baseline.md and commit/hash; verify src/App.tsx has not changed after baseline capture.
- Collect rendered screenshots of / and /solutions before touching layouts. Source-only diagnosis is explicitly incomplete.
- Validate publication-safe project claims against repository/source, README, production demo and deployment metadata.
- Review 01–04 as design policy; select responsive typography/material values after rendered comparisons.

## Stage 1 — Visual system / interactions
1. S1.A Inventory all typography/color/spacing/radius/motion rules from App, style.css and solutions.css; map their usage.
2. S1.B Build semantic surface, text and accent tokens with measured contrast; keep charcoal/amber; no sweeping reset.
3. S1.C Specify action-state matrix (default/hover/focus/pressed/touch/reduced-motion); prototype primary/secondary/link variants with stable hitboxes.
4. S1.D Respect SiteNav’s pointer-exit geometry. Assess keyboard/outside-click/Escape/mobile and history behavior, do not refactor casually.
5. S1.E Compare before/after across both routes and mobile widths.
**Exit:** no protected-copy changes; cross-route behavior unchanged; contrast issues resolved; coherent components before layout changes.

## Stage 2 — Employability-first IA / experience
1. S2.A Recruiter scan test on current site and wireframes: identify top 3 hiring signals; optimize hero and section order without content deletion.
2. S2.B Explore 2–3 hero compositions retaining clear role/current employer/actions. Implement chosen responsive treatment.
3. S2.C Develop DOWC multi-role grouping: company identity, overall period/location, separate dated roles, nested timeline, full verbatim bullets.
4. S2.D Refine About and Skills as distinct functions; categorize verified technologies with real project evidence.
5. S2.E Contact action and link correctness; employer content baseline test.
**Exit:** recruiter scenario 15s and hiring manager 2m succeed; exact baseline content verified; no hidden role descriptions.

## Stage 3 — Verified projects / storytelling
1. S3.A Build project evidence manifests from F1-Viewer, github-review-bot, aetherflow: challenge, constraints, decisions, evidence, links, safe claims, unknowns.
2. S3.B Confirm bot host (homepage EC2 vs README Railway) and AetherFlow functionality; remove misleading copy **only with provenance**, preserving employer descriptions untouched.
3. S3.C Storyboard Formula Vision featured technical stage from authentic screenshots: canonical Parquet → timing intelligence → validated R2 immutable artifacts → React playback; explain v1→v2 tradeoffs.
4. S3.D Give GitHub Review Bot a webhook/validation/inline-comment story and AetherFlow an ingestion/stats/UI story; do not force equal cards.
5. S3.E Build accessible links to live demo, source and engineering overview; media fallbacks and provenance.
**Exit:** three distinct, credible presentations with source-backed details; no invented claims; no placeholder screenshot.

## Stage 4 — Spatial/motion polish
1. S4.A Document motion duration/easing/timing families; test 2–3 portal-like primary controls and expansion prototypes.
2. S4.B Select at most a few signature motion areas: primary CTA and featured-project reveal; use real media and continuity.
3. S4.C Test hover geometry, interrupted transitions, pointer exit, touch, keyboard and reduced motion.
4. S4.D Profile rendering impact/INP, compositor effects, avoid continuous large filters and scroll listeners.
**Exit:** all functions work without animation; motion supports communication; no input frustration or regression.

## Stage 5 — Architecture/future Projects platform
1. S5.A Evaluate extracting protected experience/project data; keep smallest maintainable abstractions.
2. S5.B Typed Company/Role/ProjectEvidence/MediaManifest definitions, with attribution and optional fields.
3. S5.C Prepare route-neutral project data and future /projects without prematurely shipping a large new page.
4. S5.D Responsive media with aspect ratio, alt, captions, lazy loading, source origin and loading fallback.
5. S5.E Audit semantic headings, link text, per-route canonical/description/OG, refresh/direct loading.
**Exit:** maintainable code, accessible behavior, one shared navigation, future-page-ready model; no framework migration.

## Stage 6 — Integrated QA / refinement
1. S6.A Full-page top-to-bottom visual review of both routes: rhythm, density, harmony, identity and projects.
2. S6.B Browser matrix: 360/390/768/1024/1440/1920, keyboard/Tab/Escape, mouse hover/outside pointer, touch simulation, reduced motion.
3. S6.C Routes: /, /solutions, hash links, back/forward, refresh, mobile menus, external links, contact; no loading flashes or missing text.
4. S6.D WCAG 2.2 AA evaluation, aXe/Lighthouse + manual keyboard; performance LCP/INP/CLS measured under stated conditions.
5. S6.E Content diff against protected baseline, employer-information screening, link audits, screenshot before/after, staging deployment status.
6. S6.F Critical scorecard: originality, cohesion, credibility, precision, usability, performance, accessibility, maintainability, depth and restraint. Scores only from observed evidence.
**Exit:** draft PR with evidence and preview; hold production until express approval.

## Stage handoff contract (anti-drift)
Each stage reopens 00 charter, 01 ledger, 02 principles, 03 audit, 04 selected design and 06 decisions. Log branch/commit, changed files, tests executed, failures, pending claims, risks and next actions. Refuse to mark any automated check passed unless it actually ran. Compare both pages after every section-level change.
