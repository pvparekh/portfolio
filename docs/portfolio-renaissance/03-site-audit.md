# 03 — Site audit (source-backed, not visual QA)

Research date: 2026-10-09. Source baseline: pvparekh/portfolio@01e6f9510952776fcf1a39266270b686a5c224a4 (feat/solutions-client-acquisition). This research branch is independent of production main. Method: GitHub/Vercel API inspection plus public websites through text/structure browsing; live rendered portfolio and animation/device interactions were NOT visually inspected.

## Existing strengths to protect
- Recognizable near-black background and restrained amber accent: CSS :root has #08080D / #0D0D15 / #F59E0B; Inter, Space Grotesk and JetBrains Mono.
- DOWC grouped roles are already modeled inside one company. Separate company- and role-level timeline nodes exist.
- Homepage currently contains hero, about, experience, projects, skills, contact. main App renders Hero → About → Experience → Projects → Skills → Contact.
- /solutions already has dedicated service copy and independently owned verified public case-study model.
- Shared SiteNav persists across routes, supports /solutions/# anchors, browser History API and accessible navigation attributes. Navigation geometry is a protected regression area.

## Major issues / hypotheses
- **IA-01 High**: Three equal-size project cards in md:grid-cols-3 compress radically different engineering stories. Formula Vision merits evidence-led flagship treatment.
- **IA-02 High**: Homepage project data differs from more current repository evidence. GitHub Review Bot homepage claims AWS EC2, while the project's README lists Railway. Treat as **claim conflict**, not permission to silently rewrite content; verify live deployment/source before publication.
- **IA-03 High**: Homepage Formula Vision synopsis omits significant current v2 engineering achievements visible in docs/v2/ENGINEERING_OVERVIEW.md. AetherFlow homepage marketing copy uses 'predict cash flow' and 'in real time' while its README focuses primarily on upload analysis; verify before retaining as strong claims.
- **IA-04 High**: src/style.css --text-3=#4B5563 on #08080D has contrast ~2.64:1, below WCAG AA for ordinary text if the token is applied to text. Its role must be audited in rendered contexts. Several manually styled #6B7280 labels are ~4.13:1 on #08080D and ~4.00:1 on #0D0D15.
- **IA-05 Medium**: Project media is absent from the homepage project cards; source evidence is available but not visibly demonstrated in the cards.
- **IA-06 Medium**: src/App.tsx is ~1.3k lines, combining copy/models/components; architecture could benefit from a narrow content extraction after a strict baseline test.
- **IA-07 Medium**: CSS contains continual .speed-line, .cursor-blink, .live-link-glow animation treatments. Audit necessity, focus and reduced-motion behavior before choosing to retain.
- **IA-08 High**: Link-to-dropdown swap for Solutions is a tested bug-risk area in recent commits; never alter event geometry without pointer/keyboard/touch tests.
- **IA-09 Medium**: main.tsx removes homepage meta description and Open Graph tags on route transitions. Homepage index.html has a title but no description/OG record; audit SEO metadata.

## Unknowns not to pretend to have observed
No actual screenshots, hover behavior, mobile screenshots, focus or Lighthouse readings could be gathered from the deployed site in this environment. Vercel marked latest preview READY, which is **not** visual, functional, accessibility or performance validation. Exact section heights, contrast after CSS overlays, sticky menu behavior and page flow must be checked in a graphical browser.

## Baseline source pointers
Portfolio: src/App.tsx, src/style.css, src/main.tsx, src/SiteNav.tsx. Data Solutions: src/SolutionsPage.tsx, src/solutions.css, src/solutionsData.ts. /solutions routing: vercel.json. Branch: feat/solutions-client-acquisition @ 01e6f9510952776fcf1a39266270b686a5c224a4.
