# 05 — Data Solutions and Software Solutions designs

Both pages share the Slipstream material (amber filaments, void, grid floor, the same camera grammar), so they clearly belong to the same world. But each gets its own **spatial behavior**, derived from what that page actually says. They must not reuse the homepage's lap or each other's structures. (Today's `check-software-page.mjs` already asserts that Software must not reuse the Data hero diagram; the same principle applies in 3D.)

| | Homepage | Data Solutions | Software Solutions |
|---|---|---|---|
| World name | Slipstream | **Confluence** | **Assembly** |
| Filament behavior | Free flow, then organizes per sector | **Chaos → filtered → ordered lanes** | **Edges that snap into modules and layered planes** |
| Camera | Forward lap | **Downstream drift** (follows flow, slight descent) | **Lateral pans across a construction** (like moving along a workbench) |
| Accent | Amber | Amber + validated cyan `#38BDF8` (≤8 %) | Amber + structural white `#E2E8F0` |
| Existing motion signature kept | n/a | Upward reveals + pipeline wipe (`solutionsEffects.css`) | Lateral slide + scale-in (`solutionsEffects.css`) |

All DOM content, `<details>`, copy-email, `mailto:` drafts, case links, counts and classifications stay exactly as they are ([00 §10](00-repository-audit.md#10-behaviors-that-must-be-preserved-contract-for-every-milestone)).

---

## Data Solutions: "Confluence"

**Thesis.** The page's own story is *"From manual data work to reliable systems"*: disconnected sources, then reliable processing, then useful, trusted data (the hero diagram). Confluence makes that the physics of the world: filaments arrive from many directions, disordered and slightly flickering; they pass through a **validation gate**; and they leave as calm, parallel, evenly spaced lanes. Scrolling moves the camera downstream.

| Section (id, height @1440) | Station and structure | Content tie (no invented data) | Reveal, interaction | Mobile / reduced |
|---|---|---|---|---|
| Hero `sol-hero` 826 | cam slightly upstream and left of a large rectangular **gate**; target slightly downstream. Disordered filaments enter from the left/top; ordered lanes exit right. The gate sits behind the DOM `ArchitectureGraphic` | Mirrors the DOM 3-node diagram (input → system → output). The DOM diagram stays the readable version | The existing CSS pipeline wipe plays; the gate's lanes ignite in sync with the DOM connector traces (0.25 s + i·0.58 s, existing timings) | Gate centered behind the copy at 50 % density / still frame |
| Problems `#problems` 788 | Drifting upstream *before* the gate: **tangles**, filaments looping and stalling in three knots | Three knots = three listed problems ("weekly spreadsheet ritual", "systems that do not talk", "reporting nobody wants to touch") | Hovering a problem card speeds up its knot's jitter (the "pain") | Knots simplified / still |
| Services `#services` 2702 | Passing through the gate; downstream of it, **four channels** split out, one per service | Four channels = four offerings (`offerings.length`) | Each channel brightens as its service article reaches the upper third; opening a "Scope and requirements" disclosure widens its channel slightly | Channels stacked vertically / still |
| Delivery proof `#work` 2624 | Following one channel: **packets** (bright segments) travel the lanes; at intervals a thin ring checks them and they turn cyan ("validated") | Visualizes the "THE RESULT" pattern of `deliveryExamples` generically: packets in, validated out. No numbers, no fake throughput | Each proof card entering view emits one packet | Packets fewer / still |
| Approach `#approach` 880 | Five successive **thin gates** along a single lane | Five process steps (Discuss, Scope, Build, Validate, Hand off) | Each gate lights as its step reaches view, keyed to `.sol-process-step` anchors | Five gates in perspective / still |
| Independent `#independent` 1873 | The lane widens into a quiet **delta** with two branches | One branch per approved case study (`caseStudies.filter(publicationApproved)`) | Opening "Explore the engineering decisions" brightens its branch | Still |
| Contact `#contact` 852 | Calm open water: a single wide, slow lane toward the horizon; minimal motion | "Have a data problem worth solving?" | Clicking the copy-email button triggers a gentle pulse along the lane (in addition to the existing `aria-live` text) | Still |

**Camera:** a downstream drift with ≤6 units of lateral offset across the whole page and a slight continuous descent (y 3.0 → 1.4), like following water. Dwell plateaus as on the homepage. No crane, which keeps it distinct from homepage Skills.

---

## Software Solutions: "Assembly"

**Thesis.** The page says *"Custom software for your business… from the first requirements to a working handoff."* Assembly makes software construction tangible: filaments behave like **edges** that snap together into **modules** (thin luminous wireframe slabs), and modules stack into **layered interface planes**. The camera pans laterally along a long workbench where a product is being assembled from left to right as you scroll.

| Section (id, height @1440) | Station and structure | Content tie | Reveal, interaction | Mobile / reduced |
|---|---|---|---|---|
| Hero `sol-hero` 826 | Three translucent **layered planes** (stacked in depth, slightly offset) behind the DOM `SoftwarePreview` workspace; edges draw in from filaments | Echoes the DOM "UI concept" workspace (sidebar, content, panels), *without* duplicating or replacing it. The DOM preview keeps its "UI CONCEPT" disclaimer | Synced with the existing `software-ui-appear` and `software-row-enter` timings | Two planes / still |
| Opportunities `#opportunities` 856 | An incomplete module grid with **three missing slots**, glowing outlines where modules should be | Three opportunity cards ("idea needs a working product", "better front door", "tools have a gap") | Hovering a card makes its slot outline breathe | Still |
| Services `#services` 3125 | The camera pans along five **module bays**; in each, filaments assemble a distinct module shape | Five services (`offerings.length` = 5; the test asserts 5) | A module completes as its service article crosses the upper third. The "Related work" link highlights the matching case module further along (a spatial cross-reference) | Bays stacked vertically / still |
| Work `#work` 3694 | Five **finished modules** on display plinths, each with a small classification glyph: client (solid frame), independent (dashed), academic (dotted) | Five case studies with their visible classification (the test asserts the first is "Client website · contract work" and the last is academic) | Opening a deep dive lifts its module slightly. "Explore live project" links get a hover glint | Still |
| Approach `#approach` 813 | Modules slide together into one **assembled product slab** in five steps | Five steps (Understand, Scope, Build, Validate, Hand off) | Each step locks a piece in place | Still |
| Contact `#contact` 774 | The assembled slab rests, softly lit; an open slot glows next to it ("your project") | "Have software in mind? Let's talk." | The copy-email pulse lights the open slot | Still |

**Camera:** predominantly a **lateral truck** (+X) at constant height, with slight dolly in and out per bay. This contrasts with Data's downstream drift and the homepage's forward lap, so a visitor can feel which world they are in with their eyes closed, so to speak.

---

## Cross-page cohesion rules

1. Shared: the void, the grid floor, filament shader family, fog, scrim, HUD, Motion toggle, nav and transitions.
2. Distinct: flow topology (lap / confluence / assembly), camera axis (−Z / downstream / +X), secondary accent.
3. Same budgets, tiers and reduced-motion rules as the homepage.
4. Copy is untouched. The Software "no em dashes" assertion remains in force for any new visible text (there should be none).
