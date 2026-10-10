# 10 — Content and layout refinement, 2026-10-09

## Task and editorial priorities
Refine the existing preview without restarting design work. The user explicitly prioritized hiring value, balanced project/experience hierarchy, human-sounding copy, preserved work history, a meaningful fix for DOWC's unfilled left rail, reliable PDF download, and larger/centered project technologies. No direct production change was authorized.

## Research actually examined during this refinement
The following are **textual primary-source documentation inspections**, not visual screenshots or tested interactive reference implementations.

| ID | Source and link | Directly applicable finding | Implemented decision |
| --- | --- | --- | --- |
| R-01 | Nielsen Norman Group, [Proximity Principle](https://www.nngroup.com/articles/gestalt-proximity/) | Users infer relationships from spatial closeness; large gaps can weaken grouping, especially when columns stack at responsive breakpoints | Place the entire DOWC company header across the page and align both role headings directly with bullet sets in distinct chronological rows |
| R-02 | NN/G, [Visual Hierarchy in UX](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) | Grouping, contrast and relative scale direct scanning | Let the current role and evidence do the work; remove competing CTAs that privilege projects over professional experience |
| R-03 | NN/G, [Common Region](https://www.nngroup.com/articles/common-region/) | Boundaries can reinforce grouping but too many containers increase clutter | Retain one company rule and subtle role separators rather than filling negative space with ornamental cards |
| R-04 | NN/G, [Visual Design Principles](https://www.nngroup.com/articles/principles-visual-design/) | Scale and contrast establish priorities | Preserve the distinctive flagship Formula Vision presentation, slightly enrich technology-strip contrast, keep secondary projects smaller |
| R-05 | Baymard, [Optimal Line Length](https://baymard.com/research-articles/line-length-readability) | Body copy is generally more readable around 50–75 characters/line | Retain a 72ch maximum for role bullets and avoid spanning full-page copy even in DOWC's new width |
| R-06 | web.dev, [Responsive Web Design Basics](https://web.dev/articles/responsive-web-design-basics) | Flexible grids and wrap behavior work across screen sizes rather than fixed layout dimensions | Use a 2-column role grid on wide screens and stack title, date and bullet content below 900px |
| R-07 | web.dev, [Flexbox](https://web.dev/learn/css/flexbox) | Flexible wrapped rows let different-sized items distribute remaining space without overflow | Center and distribute readable technology labels, wrapping cleanly rather than stretching text unnaturally |
| R-08 | NN/G, [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Surface key information first, reserve deeper material for accessible follow-through | Keep concise homepage summaries with working links to repositories and Formula Vision architecture documentation |

These sources support general design decisions, not proof that the uninspected page's final pixels are already harmonious. Graphical cross-viewport review remains a release gate.

## Alternatives tested conceptually for the DOWC imbalance
- **Fill the vacant rail with metrics, logos, diagrams or an 'impact' panel:** rejected. No verified public employer metrics or authorized diagram available; risks filler and confidentiality.
- **Force identical two-column company sections with wider right text:** rejected. The employer column would remain empty for the many-bullet DOWC entry; excessively wide bullet measures decrease readability.
- **Collapse or shorten DOWC intern bullets:** rejected. Professional copy is protected verbatim and already provides useful hiring evidence.
- **Use a full-width header for the multi-role employer, then a two-column role label / achievement row:** selected. Only companies with multiple positions get this expanded layout. The shorter one-role companies retain the visually balanced composition the user already liked. Chronology and role dates stay directly beside the associated facts. At <=900px the roles stack.

## Final content decisions
- No primary or secondary hero buttons. Experience and projects can be discovered equally by scrolling or persistent navigation.
- Put **Resume** with FileText icon in the About social-action row, linking to same-origin /resume.pdf with native download and a human-friendly filename.
- Top hero microcopy: **Data Engineer · Actively Building**, green indicator retained.
- Bottom strip: **Role: Data Engineer**, **Education: CS + DS at Rutgers (Class of '26)**, existing stack unchanged, **Focus: Data + Software + AI/ML**. Focus is an interdisciplinary scope description, **not** a claim of professional ML engineer title or original model development.
- Update only the second About paragraph: preserve personal tone and reliability theme; replace obsolete 440 MB real-time streaming claim with verified Formula Vision data product and describe the GitHub reviewer with its two-pass LLM workflow.
- Projects kicker **Projects**, remove the repeated split-slogan heading, preserve Formula Vision's approved product marketing lead. Architecture panel caption is **Build / Validate / Deploy**; remove the decorative read-only tag and overly niche server footnote.
- Add **Developer Tooling** to Review Bot type label; preserve AetherFlow's label.
- Expand flagship technologies only with source-verifiable concepts: Python, FastF1, Parquet, React, TypeScript, Vite, Cloudflare R2, Recharts, Vercel. This represents both its data and UI layers without becoming a complete build-dependency manifest. The engineering overview link supplies deeper stack specifics.
- Use larger muted-light labels and center/distribute each project's technology rail; support wrapping at smaller widths.

## Protected content and validation discipline
The `const EXPERIENCE` source block is treated as immutable. It must be compared with the baseline in `08-protected-experience-baseline.md` after any JSX or CSS change. This refinement does **not** modify professional bullets, role titles, employer names, employer URLs or dates. Current branch: `feat/portfolio-renaissance-research`, Draft PR #3 targets preview branch only. No production release.

**Visual limits:** The live Vercel preview could not be opened through the available web page reader. Connector build status can establish READY, not pixel-level correctness, interaction success, WCAG compliance or Web Vitals. Inspect both routes, desktop and mobile, keyboard and touch, before declaring release quality.
