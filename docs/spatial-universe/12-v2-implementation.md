# V2 implementation: from animated website to explorable universe

**Branch:** `feat/spatial-universe-v2` (never merged to `main`, never deployed to production).
**Scope:** desktop web first. Phone layouts work and pass the checks, but phone performance tuning is deferred by request.

## 1. Diagnosis of V1

V1 ("Slipstream") was a normal vertical page with a WebGL background behind it. Content scrolled up the screen while particles streamed past. However polished, that reads as an animated website: the world never contains the content, the camera never arrives anywhere, and every section feels the same. Orange streaks dominated, and the Data and Software pages had no identity of their own.

## 2. The V2 idea

The site is now a place you travel through. Every section is a **destination** at a real position in one 3D world. Content panels are placed in that world and the camera flies between them:

- **Travel**: a cinematic move between destinations (pull back, rise, arc, approach).
- **Arrival**: the camera settles on a panel at exactly 1:1 scale so text is pixel-crisp.
- **Reading**: while you read, the camera holds still (or pans down a tall panel). Scrolling inside a dwell never moves the world.

Scroll is the only input, so the journey is deterministic, works forwards and backwards, and keeps native scrolling, deep links and the browser's back button.

## 3. Architecture

| Layer | Files | Role |
|---|---|---|
| Timeline | `src/journey/core/timeline.ts` | Pure function: scroll offset to camera pose. Builds travel, move and dwell segments from destinations, shots and measured panel heights. |
| Engine | `src/journey/core/engine.ts` | One `requestAnimationFrame` loop. Damps the camera toward the timeline pose and snaps exactly when settled. Lays out panels (including measured stacking), fades panels by distance and facing, and drives the WebGL renderer. |
| Projection | `src/journey/core/math.ts` | The same matrix math as three.js `CSS3DRenderer`. HTML panels and WebGL share one camera, with world units equal to CSS pixels. |
| Stage | `src/journey/dom/JourneyStage.tsx` | Renders panels as real HTML (selectable, focusable, indexable), the destination rail, scroll markers for deep links, and the "Standard layout" opt-out. |
| Worlds | `src/journey/worlds/*.ts` | Data only: where each destination and panel sits, which shots frame them, and each destination's palette. |
| Scenes | `src/journey/scene/**` | React Three Fiber environments, one per destination. Rendering is driven by the engine (`frameloop="never"`). |
| Mode | `src/journey/core/mode.ts` | Chooses journey or standard layout: capable desktop GPU and no reduced motion. Overrides: `?layout=classic`, `?layout=spatial`, and a remembered preference. |

Content is never duplicated or rewritten. The journey pages render the same components and copy as the standard pages; `check:journey` proves every word and link of each standard page appears in its journey.

### Shot composition

A shot frames one panel. A shot can also compose secondary panels:

- `with: [...]` names panels that share the stop. Focusing one of them (keyboard Tab) travels to that stop.
- `below: { panel }` on a panel stacks it under its parent. The engine measures heights at layout, so stacked panels never overlap at any width, and the camera frames the whole block.

This replaced several weak stops where a small note sat alone in the void.

## 4. Destination identities

| Page | World | Destinations |
|---|---|---|
| Portfolio | Deep space, midnight blue, restrained cyan, warm only where it matters | Origin (depth hairlines, immense arcs), About (teal planet with atmosphere and aurora), Experience (monolith colonnade with a lit path; the current role glows), Projects (violet hall with a reflective floor and exhibits), Skills (constellation and nebula), Contact (portal ring) |
| Data Solutions: **Confluence** | Data as water: raw amber streams become validated cyan channels | Hero lattice, problem knots, service channels, delivery gates (aqueduct), approach delta, products reservoir, contact |
| Software Solutions: **Assembly** | A graphite workbench where software is put together, travelling laterally | Exploded interface layers, a modular wall with empty slots, a module beside each service, a gallery of real applications, a converging stack, an open slot waiting for the next project |

## 5. Project exhibits

Projects are shown as physical exhibits, not cards: real screenshots on framed screens with edge light, contact shadows, a plinth, an accent light and gentle pointer tilt. Formula Vision is the flagship (replay map, chase camera, archive). AetherFlow, Perfect Threading Salon and BiasLens use real captures. The GitHub Review Bot has no UI, so its exhibit uses crops of its README pipeline and engineering notes. All captures live in `public/projects/`.

## 6. Final refinement pass (this round)

- **Software Solutions recomposed.**
  - The exploded interface layers now trail behind the preview.
  - Each service has its own module, sized and placed beside its panel.
  - The scope note stacks under the services intro.
  - The gallery screens clear the rail.
  - Contact is a single composed stop.
- **Data Solutions.**
  - The tooling note stacks under the services intro.
  - The delivery close sits under the last delivery case.
  - Contact is one stop.
  - Panels are narrowed so nothing runs under the rail.
- **Rail.** Labels stay out of the composition while you read. They appear while travelling, on hover and on keyboard focus.
- **Performance.** Three root causes of mid-journey hitches were fixed:
  1. Lights inside worlds that hide and show changed the scene's light count, which recompiled every lit shader. Hidden worlds now keep their lights at zero intensity.
  2. The reflective floor renders into an offscreen target, which needs its own shader variants. These are now warmed.
  3. Some drivers (ANGLE on D3D11) finish shader work only at first draw. The warmup now draws every world once at load, culling off, then draws the normal frame.
- **About portrait.** The journey uses a 400 px WebP (68 kB) instead of the 1.26 MB JPEG. Panel images are pre-decoded while idle. The standard page is unchanged.

## 7. Validation

All checks pass on this branch:

| Check | Result |
|---|---|
| `npm run test:unit` | 25 tests pass. Includes timeline determinism, 1:1 distance, panning, continuity and stacked-shot framing. |
| `npm run check:journey` | Pass. Every word and outbound link of the standard pages is present: 1006 words on `/`, 1915 on `/solutions`, 2017 on `/software`. Also covers determinism forward vs reverse, the reading hold, the pause control, deep links, keyboard focus travel, route changes, WebGL context loss and recovery, reduced motion, and phone layout. |
| `check-software-page`, `check-solutions-motion` | Pass |
| `compare-existing-routes` vs production `main` | Pass at ten viewports from 320 to 1920 px. The standard pages are byte-for-byte unchanged in rendered text and structure. |
| `check:experience` | Pass. The protected EXPERIENCE block is unchanged. |

## 8. Measurements

The harness is `scripts/journey-perf.mjs`. It runs a scripted 20 s scroll through each route and samples rAF deltas. Results are in `measurements/v2/frame-times.json`. The machine is an RTX 3080 laptop running headless Chromium with ANGLE D3D11.

| Profile | Route | p50 | p99 | Frames over 20 ms | Worst frame |
|---|---|---|---|---|---|
| 1440×900 @1x | Portfolio | 16.7 ms | 16.8 ms | 3 | 217 ms |
| 1440×900 @1x | Data Solutions | 16.7 | 16.8 | 0 | 16.8 |
| 1440×900 @1x | Software Solutions | 16.7 | 16.8 | 1 | 33 |
| 1280×720 @2x | Portfolio | 16.7 | 16.8 | 6 | 83 |
| 1280×720 @2x | Data Solutions | 16.7 | 16.8 | 6 | 183 |
| 1280×720 @2x | Software Solutions | 16.7 | 16.8 | 6 | 33 |

p99 is locked to the display refresh on every route. The worst single frame varies from run to run: across repeated runs, any route can show one isolated hitch of 100 to 220 ms, and the next run of the same route can be perfectly clean. Before this pass, the 1440 Portfolio run's worst frame was 600 ms and its p99 was 50 ms.

## 9. Known limitations

- Isolated one-off hitches of 100 to 220 ms still occur, most often on first arrival at About. They carry no script or WebGL render time, so they are browser-side (compositor or raster) rather than scene code. They vary from run to run.
- Phone performance is not tuned. Under CPU-throttled emulation it is choppy. Phones get the journey with capped DPR and fitted panels, and can switch to the standard layout.
- Testing is incomplete in three ways:
  - There are no real-device runs, no Safari or Firefox runs, and no screen-reader pass yet.
  - All measurements come from one machine.
- The CSS3D content layer always draws above WebGL, so a 3D object can never pass in front of a panel. Compositions avoid needing it.
- Changing route remounts the canvas, which takes a short warmup on each page.
- three.js logs a `THREE.Clock` deprecation warning from React Three Fiber internals.
