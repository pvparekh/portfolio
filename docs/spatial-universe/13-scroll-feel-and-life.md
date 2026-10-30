# Scroll feel, interaction and life

This round answers three questions:

- Is scrolling through the journey well tuned, measured against good practice?
- Can the project areas respond to the visitor?
- Can every screen feel inhabited rather than a card on black?

No copy was edited.

## 1. What good scroll feel means here

The sources agree on a few points:

- **Keep native scrolling.** Never override scroll speed or direction, and give a way out of any custom experience. The journey keeps native scroll, the browser scrollbar, deep links and back/forward, and offers a "Standard layout" switch.
  ([checklist](https://tessl.io/registry/skills/github/thedaviddias/Front-End-Checklist/scrolljacking), [designerly](https://designerly.com/scrolljacking/), [eagereyes](https://eagereyes.org/blog/2016/the-scrollytelling-scourge))
- **Budget scroll per beat.** About 1 to 2 viewport heights per text beat, and 3 to 5 for a visual showcase.
  ([scroll progress storytelling](https://www.skills.sh/avnehsbhatia/ultraui/scroll-progress-storytelling), [scrollytelling guide](https://theplusaddons.com/blog/scrollytelling/))
- **Smoothing should be gentle.** [Lenis](https://github.com/darkroomengineering/lenis) defaults to `lerp: 0.1`, which settles in roughly 450 ms at 60 fps. We use that as the upper bound for settle time.
- **Every input gets visible feedback.** A scroll with no visible response reads as broken. A scene change with no visible threshold is frustrating to trigger.

## 2. Measurable targets

`scripts/journey-feel.mjs` scores each route at 1440×900 with real wheel input. One notch is 100 px (Chromium on Windows). "Visible motion" means at least 24 px of camera travel at the panel plane.

| Metric | Target | Why |
|---|---|---|
| First motion | ≤ 1 notch | The first notch must visibly move the world. |
| Resume after a reading stop | ≤ 0.5 vh | Leaving a stop is a short push, not a wall. |
| Longest stretch with no visible motion | ≤ 4 notches | No dead zones. The final stop is excluded, because it is the destination. |
| Viewport heights per destination | 1 to 3 | Within the scrollytelling budget for text-led beats. |
| Settle to 95% after one notch | 200 to 500 ms | As smooth as Lenis defaults, without lag. |
| Velocity step ratio | ≤ 0.35 | Camera velocity ramps when a notch lands instead of jumping. |
| Speed variation under a steady stream of notches | CV ≤ 0.45 | Steady input produces steady motion. |

## 3. Before and after

Results are in `measurements/v2/scroll-feel-before.json` and `measurements/v2/scroll-feel.json`.

| Metric | Before (Portfolio) | After (Portfolio / Data / Software) |
|---|---|---|
| First motion | 880 px (8.8 notches) | 2 / 10 / 10 px |
| Resume after a reading stop | 0.68 vh | 0.35 / 0.36 / 0.35 vh |
| Longest dead stretch | 9.2 notches | 3.1 notches on every route |
| Viewport heights per destination | 3.98 | 2.26 / 2.73 / 2.85 |
| Settle 95% | 1600 ms | 450 / 433 / 467 ms |
| Velocity step ratio | 1.0 (jumps) | 0.33 / 0.34 / 0.35 |
| Stream speed CV | 2.36* | 0.24 / 0.27 / 0.22 |

Every route passes every target in the confirming run. The velocity step ratio sits at the edge of its limit, and individual runs vary by a few hundredths.

\* The "before" stream figure used an earlier version of the measurement window, so it is indicative only.

## 4. What changed and why

1. **No hold on landing, and shorter reading holds.**
   - The first stop no longer has a dead zone.
   - Reading holds dropped from 0.6 to 0.35 vh.
   - Travel dropped from 1.5 to 1.0 vh, and moves from 0.75 to 0.55 vh.
   - Tall panels still pan 1:1 with scroll, so long content never rushes.
2. **Easing that starts moving.** Travel used `easeInOutCubic`, so one notch at the start of a 1350 px travel moved the camera about 0.2% of the way. Travel now blends linear and sine easing: motion begins on the first notch and arrivals still settle.
3. **A spring on scroll, not on the camera.** A critically damped spring (ω = 13) smooths the scroll offset, and the camera samples the path at that smoothed offset. Wheel notches become continuous velocity in both directions. The camera never cuts corners off the authored path, and it still lands exactly on the 1:1 pose so text is crisp.
4. **Arc-length parameterized paths.** Camera paths are splines through unevenly spaced control points. Equal parameter steps covered very different distances, so speed jumped several-fold at each control point. Paths now move at constant speed per unit of eased scroll, which took stream speed variation from about 1.2 to about 0.2.

Scrolling up replays the same path in reverse with the same smoothing: the journey is a pure function of scroll position, which the unit tests and `check:journey` verify.

## 5. Interaction: exhibits that respond

- **Hover a project screen.** It lifts toward you (about 150 px in depth) and rises slightly. Its accent edge brightens and a glow blooms behind it. On the homepage hall, where screens stand on the floor, the contact shadow spreads and softens, as a lifted object's shadow would. Floating teaser screens have no floor shadow. The other screens in the set dim, so attention follows the pointer.
- **Click a screen.** An inspect view opens the full screenshot. It is a modal dialog with focus moved inside and returned on close. Escape, the backdrop and the close button dismiss it, arrow keys step through the set, and there is no animation under reduced motion.
- **Hover a work card.** The HTML cards (project panels, experience, case studies) lift 6 px with a deeper shadow and an accent edge. This only applies on fine pointers with motion allowed.
- **How picking works.** The HTML layer sits above WebGL, so React Three Fiber's own pointer events never fire. Instead, `scene/shared/pick.tsx` raycasts once per frame against registered screens using the engine's pointer. It yields whenever the pointer is over real content, and only runs while the camera is not travelling.
- **Covered by tests.** `check:journey` asserts that hover is detected, that a click opens the inspect view with focus inside, that the arrow keys step through screenshots, and that Escape closes it.

## 6. Life and use of space

- **Dust field.** One draw call of about 900 points wraps around the camera on every page. It fades near the eye (nothing pops in front of text) and toward the box edge (no visible wrap). It drifts slowly and freezes when motion is paused.
- **Teasers beside sparse intros.** The Projects intro, the Software work intro and the Data products intro now share their stop with floating real screenshots of the work ahead. These are hoverable and inspectable.
- **Experience, grouped like a profile.**
  - The current employer is one stop: every role hangs under a single company header on a connecting timeline, and the current role has a live green node.
  - Earlier companies share a stop in two columns.
  - Grouping is derived from the data, and all copy is unchanged.
- **Formula Vision's installation.** A holographic circuit loop in F1 red floats behind its screens. A car of light runs laps and leaves a fading trail. The loop is decorative and abstract: it is not a real circuit and shows no data.
