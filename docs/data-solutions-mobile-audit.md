# Data Solutions: phone-only responsive refinement

**Date:** 2026-10-09/10
**Repository:** `pvparekh/portfolio`
**Branch:** `feat/solutions-mobile-experience`
**Baseline:** production `main` at `6fc5409dba86c6cd85eafe3c6cf1a2c8fbed725b`.

## Immutable boundaries

**Desktop and Portfolio are locked.** Do not edit `src/App.tsx`, `src/SolutionsPage.tsx`, `src/SiteNav.tsx`, `src/style.css`, `src/solutions.css`, `src/main.tsx`, the project or service data, or any user-facing copy. Append mobile-specific CSS to `src/mobile.css`, and limit every added selector to `.solutions` inside bounded media queries. No desktop rule or 768px+ ordinary-window rule is introduced. Production remains unchanged pending explicit user approval.

## Research principles and grounded sources

- **Reflow without omitted content:** WCAG 2.2 understanding for success criterion 1.4.10 calls for content to reflow down to approximately 320 CSS pixels without two-dimensional scrolling (apart from inherent two-dimensional layouts). Source: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- **Responsive breakpoints are driven by layout needs:** web.dev describes choosing responsive adaptation based on screen dimensions and device capabilities. Source: https://web.dev/articles/responsive-web-design-basics
- **Readable flex/grid content:** Flex and grid children may have `min-width:auto`; `min-width:0` and `overflow-wrap:anywhere` prevent intrinsic long labels from forcing wider cards. Sources: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/min-width and https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-wrap
- **Comfortable tap controls:** W3C WCAG 2.2 target-size guidance has a 24 CSS pixel minimum or spacing exception, with 44×44 pixels as an enhanced ergonomic target. In the mobile layout, primary links, native disclosure summaries and the copy control use a practical 44px height. Sources: https://www.w3.org/WAI/WCAG22/Techniques/css/C42 and https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced

These are design guidelines, not a claim of audited accessibility compliance.

## Before/after component audit

| Existing condition observed in source | Mobile-only adjustment |
|---|---|
| Solutions hero has substantial top padding beneath the shared 64px nav and tall headline and intro margins | Slightly reduce mobile hero top whitespace, scale the headline fluidly, and preserve the two original CTAs in a 1-column or auto-fitting layout |
| Source → System → Output illustration uses three small side-by-side nodes above 520px | Stack all three stages vertically up to 767px, including rotating decorative connecting arrows, without hiding a single label |
| Intro, problem cards, and section spacing have multiple independent CSS overrides | Normalize portrait section rhythm and let headings reflow at 320px |
| Services contain long narratives, disclosure rows, and horizontally wrapping technical chips | Stack information in semantic source order, keep native details and all text, enlarge summaries, and arrange complete technical chip lists in responsive grids |
| Engineering case-study facts pair lengthy body text with a narrow left label rail | Put labels above readable paragraphs in portrait, keeping all case-study content and technical drill-down panels |
| Five process cards can become a cramped multi-column sequence at 701–767px | Use a single-column series and hide only decorative side-pointing arrows; preserve all numbered step content |
| Contact email and copy button can crowd one row | Stack the address and copy action, preserving the actual clipboard handler, status announcement and mailto action |
| Touch landscape needs deliberate spacing | Use a short-screen media query requiring `orientation:landscape`, `hover:none` and `pointer:coarse`, leaving mouse-driven desktop alone |

## Source-control verification

- Mobile-only CSS inserted into `src/mobile.css` beneath the existing phone styles. Original file contents remain an exact prefix to the new CSS.
- Portrait breakpoint: `@media screen and (max-width:767px)`; small-phone refinement `@media screen and (max-width:420px)`.
- Touch-landscape breakpoint: `@media screen and (orientation:landscape) and (max-width:980px) and (max-height:560px) and (hover:none) and (pointer:coarse)`.
- All newly introduced selectors are `.solutions`-scoped; no other source files altered apart from this research document.

## Manual QA matrix before merge

Test `/solutions` and `/` at 320×568, 360×740, 375×667, 390×844, 414×896, 430×932, 600×800, 667×375, 740×430, 844×390, 932×430, 768×1024, and 1440×900. At each viewport check no horizontal document overflow or clipped text, navigation and anchors reachable, CTAs readable, all diagram labels intact and direction clear, disclosure controls open and close, case-study details scroll properly, service tag grids fit, email copying reports status, and content remains readable at enlarged browser text sizes. On desktop compare the before/after visually and programmatically: nothing should change.

**Limitations:** A passing cloud build confirms compilation, not precise phone layout or touch interaction. Do not assert that Safari/Chrome cross-device screenshot QA passed without running it.
