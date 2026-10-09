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

## Implementation verification — 2026-10-09
- [x] New branch `feat/portfolio-renaissance-research` created from active preview feature branch; **no production branch writes, merges, or promotions**.
- [x] Stage 1 targeted improvements: muted text token, keyboard focus outlines and CSS reduced-motion behavior.
- [x] Stage 2: editorial responsive DOWC/company/role progression and recruiter-first hero, keeping entire original `EXPERIENCE` block unchanged.
- [x] Stage 3: differentiated project narratives, Formula Vision flagship architecture and proof surface; conservative copy matched against public engineering sources.
- [x] Stage 5 partial: HTML + in-app per-route metadata correctness and canonical tags.
- [x] Protected experience exact block equality checked again after project redesign (length 3129 characters) against original feature branch: **identical**.
- [x] Vercel PREVIEW builds reported READY through the Stage 3 project CSS commit `00e9128606a739df88d5f667f003532fcbd55345`. Deployment state ≠ visual QA.
- [x] Final post-metadata build verified: Vercel deployment `dpl_9kA4HL3ZTnjvnzEcF26q57W9u1A8` for commit `907da1787e07162d6af5ef36407c1b3e0037c5a9` reports READY (2026-10-09). This is a build/deployment status only, not a browser functional check.
- [ ] Stage 4 advanced signature motion design not implemented; Stage 5 typed source/media architecture incomplete; Stage 6 browser QA pending.

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
**Partial preview implementation and research package.** Source changes exist on `feat/portfolio-renaissance-research`; no production changes, no merge or deployment promotion, no claim of full six-stage completion. Stage 1–3 have targeted implementation; stages 4–6 are incomplete. Next gate: browser screenshots and cross-device functional/visual inspection, source provenance review, then refinements. A Vercel READY build is not proof of UI performance or accessibility.

## Preview and review links
- Draft PR: https://github.com/pvparekh/portfolio/pull/3
- Inspected READY preview (2026-10-09): https://portfolio-i3p1zi3xk-pvparekhs-projects.vercel.app/
- Branch: https://github.com/pvparekh/portfolio/tree/feat/portfolio-renaissance-research
- No merge or production promotion authorized.

## Follow-up implementation verification, 2026-10-09

**Branch:** feat/portfolio-renaissance-research, continuing Draft PR #3. **Production:** unchanged.

- [x] Hero removes Explore Projects, View Experience and Download Resume buttons.
- [x] Hero eyebrow updated to Data Engineer / Actively Building with existing green dot.
- [x] Status strip: role Data Engineer; education CS + DS at Rutgers (Class of '26); stack original unchanged; focus Data + Software + AI/ML.
- [x] About social row contains a fourth, matching Resume anchor with FileText icon, same-origin /resume.pdf href and HTML download attribute. Actual user-agent download behavior not browser-tested.
- [x] About biography replaces obsolete 440 MB real-time streaming reference; preserves reviewer/two-pass LLM and work reliability theme.
- [x] Projects kicker changed to Projects; removed awkward repeated headline phrasing. Architecture caption is Build / Validate / Deploy; read-only caption and niche historical API footnote removed. GitHub Review Bot labelled Developer Tooling.
- [x] Formula Vision technology rail now includes source-backed Python, FastF1, Parquet, React, TypeScript, Vite, Cloudflare R2, Recharts and Vercel with stronger contrast and center layout; secondary rails distribute labels evenly.
- [x] Multi-role DOWC header spans full section width, and both roles use heading/date alongside bullet content. Single-role employers retain original compact two-column presentation. On smaller widths the role grid stacks.
- [x] Entire const EXPERIENCE source block checked unchanged against upstream feature branch (3129 source characters; trimmed 3128) and the saved baseline.
- [x] Built-in immutable-copy test script checked by source comparison against current content and saved baseline. Vercel READY reported for `2f2a1fde0b8529a8ee0c145a3d8f58693ab3da0d`, whose npm build script executes the experience test before TypeScript and Vite build.
- [ ] Visual QA: no screenshots or browser interaction measurements were available; desktop/mobile harmony, Actual download, keyboard focus and all project links need manual or accessible browser verification.
- [ ] WCAG audit, performance metrics and multi-device behavioral tests still incomplete.

**Validated READY preview for this implementation:** https://portfolio-9x1jvzf66-pvparekhs-projects.vercel.app/ (commit 2f2a1fde0b8529a8ee0c145a3d8f58693ab3da0d; subsequent documentation commits have no runtime changes).
**Research for this refinement:** docs/portfolio-renaissance/10-refinement-research-2026-10-09.md.


## Follow-up: company-first nested experience design (2026-10-09)

**Scope:** Experience section only. Existing navbar, About, Projects and protected employer content untouched.

- [x] DOWC now has the supplied white wordmark in a dedicated square dark company logo tile, cropped from the user's provided raster and stored at `public/dowc-logo-supplied.png`; the original baseline logo path remains unchanged.
- [x] All companies display the 01/02/03 EXPERIENCE index and company header above associated roles.
- [x] DOWC roles are vertically nested with a connecting rail and role nodes, in newest-first order, without role numbers.
- [x] Single-role employers have no contrived timeline or POSITION labels.
- [x] Job titles, employment type and dates stack in order, with an inline, compact green CURRENT badge attached to Junior Data Engineer.
- [x] The current-role rail node and badge beacon have animated glow/pulse; `prefers-reduced-motion` makes them static.
- [x] Profession descriptions and every literal `EXPERIENCE` entry match the protected baseline exactly. Inline display-only type labels are inferred from established job information.
- [x] Company names use semantic level-three headings, with role titles in level-four headings.
- [x] Vercel reported READY on preview build `66501beeea35ba54668fdfe4ceea42d6e99d9e2b` after the new JSX and CSS.
- [ ] Rendered desktop/mobile screenshots, precise animation appearance, and full keyboard/screen-reader testing remain unverified in this tool environment.

Design: single-column information hierarchy with company logo/name and tenure at the parent level, role titles and accomplishments underneath, a timeline limited to multi-role companies. Replaces the previous two-column and later role-grid alternatives entirely.

No production deployment or merge authorized.


## User-authorized content and tenure refinement (2026-10-09)
Commit `2d2f6b53f36da858118e685c4f5c8880ab7809fc` was applied atomically to the draft preview branch only.

- [x] **Original Experience source archived** as `08-original-experience-snapshot.md`. Current `08-protected-experience-baseline.md` updated only for the user's explicitly supplied DOWC Junior Data Engineer and Data Analytics Intern bullet replacements. All other experience entries and metadata remain immutable. Existing `npm run check:experience` build guard continues to compare against the new approved baseline.
- [x] Replaced all 2 Junior and 5 Data Analytics Intern bullets exactly with user-supplied descriptions. User-reported figures, including the ~1.8 GB / ~1.65M rows per day and 400+ lines, are not independently validated or approved for public employer disclosure.
- [x] Dynamic date formatting for employer tenure and each role: inclusive calendar months (Jun–Sep 2026 = 4 mos; Sep–Oct 2026 = 2 mos; Sep–Nov 2026 = 3 mos). Ended jobs use their stored end month, not today. The open page checks for a calendar month transition once per minute and on tab visibility.
- [x] Work arrangement in company metadata: DOWC `Parsippany, NJ · On-site`; Marketeq `Remote`; Perfect Threading `Async`. Employment type remains a separate line next to role title.
- [x] Removed the small green pulse dot inside the CURRENT badge, preserving the larger animated green timeline node.
- [x] Reduced between-company padding and within-DOWC nested role spacing, with connector lengths adjusted to match.
- [x] Added only relevant skills: Selenium, Power Automate, Tableau, Power BI / DAX. All existing skill entries remain.
- [x] Contact copy gains a borderless Explore Data Solutions text action with arrow using the existing SPA navigate callback to `/solutions`, preserving browser navigation / route state.
- [x] Hero bottom status strip restores the original `STATUS / AVAILABLE` green-value convention as a fifth item, alongside ROLE, EDUCATION, STACK, FOCUS. Education becomes `CS + DS @ Rutgers-NB (Class of '26)`, and eyebrow is only `Actively Building`.
- [x] Vercel reported READY for the full changed bundle at the implementation commit.
- [ ] Pixel-level and mobile cross-width review, real browser navigation / scrolling and WCAG audit cannot be certified from connector build status alone.

**Risk note:** Public-facing employer-specific throughput and workflow claims were supplied by the user. Confirm permission to disclose such internal operational figures before merging to production.
