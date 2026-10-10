# Software Solutions — implementation and review notes

Branch: `feat/software-solutions-client-experience`  
Baseline: `2bfcc89c76cce56f661d7a1bc7981f7ca97fd6da` (GitHub `main`, 2026-10-10). Production association in Vercel could not be inspected because the project read API denied access.

## Positioning and information architecture
Evaluated three directions: (A) idea-to-application, (B) software built for how a business works, (C) custom software for real business needs. Chose **Custom software, built for the way you work** for clarity and fit with the existing editorial hero.

Client journey: opportunity recognition → scoped, deliverable-oriented services → real projects → transparent project process → low-friction contact. Proof distinguishes commissioned salon website, independent products, developer tooling, and academic work. Five services were chosen to align with completed evidence and realistically bounded software scopes.

The software diagram is a project-delivery sequence (goal/users → design/build → working software), not a data processing pipeline.

## Sources and claims
| Example | Reliability and role | Public evidence | Publication boundary |
| --- | --- | --- | --- |
| Perfect Threading | Public repository plus approved portfolio experience; real contract delivery | https://github.com/pvparekh/Perfect-Threading | The ~30% improvement is owner-reported; omitted from new case study pending independent verification |
| Formula Vision | README and public engineering docs, plus private source reviewed for architecture context | https://github.com/pvparekh/formula-vision-documentation | Source private; no private URL exposed; historical server design not attributed to the current replay |
| AetherFlow | Public project README | https://github.com/pvparekh/aetherflow | Email-digest preference is a placeholder, not a marketed feature |
| GitHub Review Bot | Public README describes GitHub App, FastAPI, webhook and Railway | https://github.com/pvparekh/github-review-bot | Current deployment not verified; historical speed not promised |
| BiasLens | Public README and course-project declaration | https://github.com/pvparekh/BiasLens | Academic status shown explicitly |
| Other repositories | Reviewed accessible account inventory | https://github.com/pvparekh | Not promoted without stronger customer-facing evidence |

Public live URLs are documented by the project owners but external HTTP verification was unavailable in this environment. This is **not** evidence that every demo is available today.

## Research findings
- Nielsen Norman Group B2B research: support buyers evaluating solutions, capabilities and proof without obstructing basic answers. https://www.nngroup.com/reports/b2b-websites-usability/
- NN/g on credibility: professional polish is necessary but should be paired with information about expertise. https://www.nngroup.com/reports/ecommerce-ux-trust-and-credibility/
- Retool customer stories: prioritize the workflow and the people helped, then expose implementation detail. https://retool.com/customers
- Stripe customer stories: use concrete outcomes and recognizable buyer framing. https://stripe.com/customers
- Plaid customer stories: make the problem, delivered solution and observed result easily skimmable. https://plaid.com/customer-stories/
- Linear and Vercel product experiences: restrained typography and coherent interaction language are more useful here than wholesale imitation. https://linear.app/ and https://vercel.com/
- W3C reflow guidance: preserve vertical reading order and reflow at 320 CSS px. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- thoughtbot services: starts with client/project stage and user needs before technology-level offerings. Adapted as a small-scope solo-developer version, not an agency comparison. https://thoughtbot.com/services
- Vercel Git configuration: branch-specific `git.deploymentEnabled` supports disabling automatic deployments. https://vercel.com/docs/project-configuration/git-configuration

These are observed examples and transferable guidelines, not measured conversion gains. The service taxonomy and copy are editorial hypotheses to evaluate with actual customer feedback.

## Protected existing content
`src/App.tsx`, `src/SolutionsPage.tsx`, `src/solutionsData.ts`, `src/deliveryExamples.ts`, `src/solutions.css`, `src/mobile.css`, `src/style.css`, and existing professional experience wording are unchanged. Software's extra styling is scoped to `.software-solutions`. Shared files changed only for routing, navigation and the new static entrypoint.

## Deployment lock
The feature branch adds `git.deploymentEnabled[feat/software-solutions-client-experience] = false` in its own `vercel.json`. This relies on Vercel honoring documented branch configuration; authorization to inspect live Vercel project settings was unavailable. No manual deployment, production promotion or merge is authorized.

## Validation summary, 2026-10-10

**Passing validation:** GitHub Actions [run 38088477392](https://github.com/pvparekh/portfolio/actions/runs/38088477392) (commit `d0ccbc344d72868a9f18865a6af05b4ec1c91a97`).
- `npm ci` and `npm run build` passed (protected experience baseline, TypeScript, and Vite).
- All three static entrypoints were generated.
- Headless Chromium route and interaction suite passed: Software hero, five services, five projects, correct classifications, private-source link exclusion, service disclosures, data/software navigation, browser back/forward, reload, keyboard dropdown controls, contact path, mailto draft, clipboard fallback.
- Automated viewport reflow and mobile-menu checks passed at 320×568, 360×740, 390×844, 430×932, 667×375, 844×390, 768×1024, 1024×768, 1440×900, 1920×1080, with reduced-motion enabled.
- Four full-height screenshots were generated for 320, 390, 768 and 1440 widths; viewed representative top, middle and case-study crops.
- Portfolio and Data Solutions load in the browser. Their original protected source files are not modified.

**Remaining checks / publication limitations**
- Source-level preservation is proven. Exact before/after rendered pixel comparisons of Portfolio and Data Solutions have not been performed.
- Real Safari/iOS/Android browser and screen-reader testing, high browser zoom, and full WCAG audit have not been performed.
- Public application URL uptime was not independently confirmed; available browsers cannot access external live demos here.
- Modifier-click native link behavior is preserved in code but not specifically automated.
- The GitHub action may report upstream dependency vulnerability notices from `npm ci`; do not confuse a build pass with dependency-audit clearance.
- Vercel project introspection is unauthorized in the current connection. The branch-specific deployment suppression is documented and configured, but no manual Vercel verification/deployment has been attempted.
- Independently verify any future numerical business-impact claim before publication.

Before a production release, review fresh browser screenshots, check live demos and run a manual cross-browser pass. Production merge and deployment remain explicitly unauthorized.

## Deferred cross-page ideas
- Consider extracting the stable route-aware nav hover gate after visual regression coverage exists.
- Consider stronger project-to-service crosslinks on Data Solutions after separate approval.
- Consider shared per-route SEO metadata mapping, without changing approved marketing copy.
