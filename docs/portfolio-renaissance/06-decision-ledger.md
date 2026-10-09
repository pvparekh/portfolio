# 06 — Decision ledger

Research date: 2026-10-09. Source baseline: pvparekh/portfolio@01e6f9510952776fcf1a39266270b686a5c224a4 (feat/solutions-client-acquisition). This research branch is independent of production main. Method: GitHub/Vercel API inspection plus public websites through text/structure browsing; live rendered portfolio and animation/device interactions were NOT visually inspected.

| ID | Date | Decision | Problem / alternatives | Evidence / rationale | Employability | A11y & perf | Risk / verification | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-001 | 2026-10-09 | Preserve active feature branch; create a new descendant for research | Main is older; editing main would compromise production | Vercel / GitHub state; active PR #2 | Keeps genuine current work | none | compare against ancestor SHA before PR | implemented |
| DEC-002 | 2026-10-09 | Capture immutable experience baseline first | Redesign must not rewrite employer copy | App EXPERIENCE literal; charter 2.1 | protects credible work history | disclosure must remain navigable | exact-source and rendered-text comparison later | implemented |
| DEC-003 | 2026-10-09 | Select Systems Atlas as proposed art direction | Equal-card template undersells technical projects; alternatives Observatory and Monograph | REF-001, 020, 021, 023, DOC-03–08, source audit | quick scanning plus deep links | text-first, lower weight | graphical rendering not yet validated | provisional |
| DEC-004 | 2026-10-09 | Treat deployment READY as build status only | A READY response does not prove browser usability | Vercel deployment record | prevents fake testing claims | explicit manual QA gate | screenshots + Playwright pending | implemented |
| DEC-005 | 2026-10-09 | Flag project copy conflict, do not rewrite yet | EC2 vs Railway; marketing promises not all evidenced | App PROJECTS vs Review Bot README and AetherFlow README | improves trust | none | inspect current manifests and actual demos | open |
| DEC-006 | 2026-10-09 | Do not make cosmetic site changes before screenshot/contrast review | Unevidenced visual edits can regress a functioning site | audit and user instruction | protects professional polish | contrast tokens require validation | inspect graphical browser, then stage1 patch | gate |
