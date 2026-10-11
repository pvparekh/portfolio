# Phone-only responsive implementation and research

**Date:** 2026-10-09. **Base:** production `main` at `45ca1287dfbd2f163f430169e6b080d6883bde0a`. **Destination:** `feat/mobile-portrait-landscape-only`, a preview branch. **Nonnegotiable:** the desktop presentation, copy, navigation behavior and styling are unchanged; this is not a desktop redesign.

## Evidence and decisions

The code audit inspected `src/App.tsx`, `src/SiteNav.tsx`, `src/SolutionsPage.tsx`, `src/style.css`, `src/solutions.css`, `src/main.tsx`, and the existing viewport meta tag. It distinguishes observed source properties from predictions that need graphical testing.

1. **Avoid global horizontal page scrolling.** W3C's WCAG 1.4.10 Reflow understanding explains that a vertically scrolling page should be readable at 320 CSS pixels without bidirectional scrolling or hiding content. The mobile hero currently uses `min-w-max` and `flex-nowrap` for five telemetry fields, with a nested horizontal scrollbar. **Decision:** on phones replace that layout through scoped CSS with a 2-column grid and a centered status row, preserving all five entries. Technologies and service stack tags also reflow instead of being cut or silently omitted. Source: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
2. **Size interactions for touch.** WCAG 2.2 SC 2.5.8 sets a 24 CSS pixel minimum target size or spacing exception; a 44px practical target was chosen for the mobile navigation toggle and primary links. Existing full-size project CTAs and keyboard focus remain. Source: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
3. **Use capability-aware media queries.** MDN and web.dev describe viewport `width`, `orientation`, `hover`, and `pointer` as available features. Phone portrait is primarily `max-width:767px`; special landscape treatment requires a short viewport (up to 560px high), viewport width at most 980px, `hover:none`, and `pointer:coarse`. This prevents the large-screen desktop layout from unexpectedly receiving touch-landscape overrides. Sources: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using and https://web.dev/articles/responsive-web-design-basics
4. **Do not redesign components that already adapt correctly.** Solutions already has a columnar service layout below 700px, a vertically stacked three-step source/system/output diagram below 520px, wrapping tool chips and a mobile contact layout. The portfolio already has a mobile nav, mobile Experience rail, and single-column project cards at narrow widths. Preserve those and fix only crowding and overflow.
5. **Maintain document semantics and SEO.** The mobile enhancements use CSS only. All heading hierarchy, date math, resume route, project links, contact actions, Solutions page, DOWC experience, content, and animations retain their original logic. Source text, element ordering, and accessible labels are not changed.
6. **No desktop CSS changes.** The newly imported `src/mobile.css` contains nothing outside `@media` blocks. Existing `style.css` and `solutions.css` are unchanged byte-for-byte. Existing class names remain; added semantic hook class tokens have no definitions outside the new mobile CSS. Main imports one additional stylesheet after the original style sheet.

## Targeted layout decisions

| Area | Portrait phone | Short touch landscape |
|---|---|---|
| Shared navigation | 44px toggle, full-width disclosure with scrollable height capped to viewport | Use the same existing mobile menu rather than squeezing the desktop navbar |
| Hero | Room for two-line name, tagline, copy; bottom telemetry grid 2×2 plus status; hide nonessential scroll cue and decorative grid reference | Smaller large-name typography; compact 3-column wrapped telemetry rows |
| About | Biography flows at full available width, technical and academic profile panels stack; no squeezed academic labels | Existing responsive arrangement left alone |
| Experience | Narrower timeline indentation, full dates wrap, compact employer information, unchanged job bullets | Existing desktop layout left alone unless viewport also meets narrow width |
| Formula Vision | Vertical flagship remains; word wraps, action button stretches on phone, architecture labels don't clip | Preserve flagship architecture with wrapped technical labels |
| Supporting projects | One project per row, toplines stack, link actions wrap; technology lists become visible multi-column tiles | Technology labels flow into equal-width grid cells |
| Skills | Long category heading and skill tags reflow inside each card | Two-column cards instead of three cramped cards |
| Data Solutions | Topline and diagram captions wrap; existing vertical diagram preserved; mobile tool and case-study tags reflow in two columns on <=420px | Shorter visual diagram elements and wrapped captions |
| Contact | Email and metadata wrap; 44px minimum interactive targets | Same actions and links, no missing options |

## Suggested acceptance tests before production

**Devices/viewport matrix:** 320×568, 360×740, 375×667, 390×844, 414×896, 430×932 portrait; 640×360, 740×430, 844×390, 932×430 landscape touch; 768×1024 tablet; 1280×800, 1440×900, 1920×1080 desktop.

**Hands-on checks:** no document-level horizontal overflow at 320px, no clipped words or cards, hero contents and telemetry don't overlap, all menu subsections reachable and dismissible on short phone landscape, all touch actions work, Data Solutions copy-email feedback visible, technology tiles keep every element readable, no bad wrapping or tiny clickable links, no problematic content occlusion by sticky nav, device rotation and 200% browser text scaling do not hide content.

**Regression checks:** 1) Compare `App.tsx` with baseline after stripping only the new class tokens. 2) Compare `SiteNav.tsx` after stripping only the three mobile selector classes. 3) Compare `main.tsx` after removing only the `mobile.css` import. 4) Ensure the original two CSS files are unchanged. 5) Run `npm run build`, which already enforces the protected professional-experience baseline. 6) Review real screenshots on Safari iOS and Chrome Android before production publication.

**Limitations:** Build success and static code review do not prove pixel-perfect wrapping, scrolling, or orientation behavior. Browser rendering and device-specific safe areas remain to be tested; no claim of WCAG certification or visual QA is made from code review alone.
