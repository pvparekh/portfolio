# Smoothness: root causes, fixes and how it is tested

Feedback from desktop review: scrolling felt laggy and could "spazz" back and forth, sometimes persistently until scrolled away from. The background seemed to freeze. The Formula Vision car glitched. The "Data Engineer" typing was slow.

Each symptom was traced to a measured cause before it was fixed.

## Causes found

| Symptom | Root cause | Evidence |
|---|---|---|
| Persistent "spazz" at some positions that stopped when scrolled away from | **Hover feedback loops.** A card or 3D screen lifted on hover, moved out from under the still cursor, un-hovered, dropped back and re-hovered, over and over. Scrolling slides content under the cursor, so these loops triggered at card edges. | Hover-state sampling with a still cursor; fixed per the standard practice of hit-testing a stable parent ([CodePen](https://codepen.io/csilverman/post/fixing-the-jitter-bug), [CSS-Tricks](https://css-tricks.com/?p=255578), [Phabricator](https://secure.phabricator.com/D21133)). |
| Camera bouncing back and forth when scrolling fast | **Path design.** Each departure pulled straight back off the panel the camera had just flown into. Scrolling through without stopping chained those reversals together. | Per-frame displacement analysis: 1 to 6 direction reversals in fast and flick scrolls. |
| Background freezing after load | **Warmup redraws.** The warmup drew the entire universe in one frame, twice after load. | Idle at origin: two frames of 665 ms and 955 ms in 8 s. |
| Motion slow or pausing, car stuttering | **Engine clock bugs.** The clock was capped per frame, and it was reset at the end of each frame's work, so every frame lost its own processing time. | The scene clock advanced 5.4 s in 8 s of wall time. |
| Hitches arriving at sections | **Rasterization and decoding.** Large blurred CSS shadows (and nav backdrop blur) on 3D-transformed panels were expensive to rasterize on first appearance. Screenshot textures were decoded on the main thread. | Worst arrival frame was 133 ms with shadows and 17 to 33 ms without. |
| Projects section the heaviest | **Planar reflector.** The real-time floor reflection re-rendered the whole scene every frame, and was rebuilt on resize. | Per-section frame analysis. |
| Some transitions needing much more scroll than similar ones | **Fixed scroll lengths.** Every transition had the same scroll length whatever the camera's distance. | Timeline inspection. |

## Fixes

- **Stable hover targets.** HTML cards read hover from the unmoving panel and lift the card inside it. 3D screens are picked against a fixed, invisible proxy at their resting pose.
- **No reversing geometry.** Travel departs toward the next destination, rising slightly. Moves between neighbouring shots use a shallow arc.
- **Speed-adaptive glide.** At reading speed the camera rides the exact authored path, so text lands at a crisp 1:1. As scroll speed rises past about 1.2 viewports per second, the camera low-passes its path, up to τ = 0.3 s. The effect is continuous in speed, so it fades out as scrolling slows.
- **Spring on scroll, plus arc-length paths.** These came from the previous round and are retained: a critically damped spring on the scroll offset, and constant camera speed per unit of scroll.
- **Real-time clock.** Ambient time advances by the true elapsed time each frame, and the loop no longer resets its timer mid-run.
- **Non-blocking warmup.**
  - Shaders compile with `compileAsync`, using `KHR_parallel_shader_compile` where available ([three.js #19752](https://github.com/mrdoob/three.js/pull/19752), [MDN](https://developer.mozilla.org/docs/Web/API/KHR_parallel_shader_compile)).
  - Textures upload one per frame.
  - World parts are first-drawn in small batches during idle time, nearest world first, clipped to a single pixel.
- **Off-thread image decoding.** Exhibit screenshots load through `ImageBitmapLoader`.
- **No blur in the 3D layer.** In journey mode, panel box-shadows are removed and the nav uses a solid tint instead of backdrop blur.
- **Glossy shader floor instead of the planar reflector**, with exhibit-coloured light pools. Adaptive resolution steps the render scale down when frames run over budget, with wide hysteresis.
- **Distance-aware scroll lengths**, gently scaled with camera path length.
- **Continuous ambient life.** The sky slowly wheels, so the background is never static, even at rest.

## How it is tested

`scripts/journey-scroll-qa.mjs` runs on every route at 1440×900 with real input. It fails on any of the following:

- Idle after load: any frame over 60 ms, or ambient time falling behind real time.
- Each scroll profile (slow, normal, fast and flick wheel; rapid reversals; scrollbar drag; keyboard PageDown, End and Home):
  - camera direction reversals while input moves one way;
  - more than 2 dropped frames;
  - failing to come to rest within 1.4 s;
  - any frame where the scene clock differs from wall time.
- Hover: any state change with a still cursor, probed at every reading stop for both 3D screens and HTML cards. Also hover chatter while content scrolls under a still cursor.

Current result: **ALL SCROLL QA PASSED** on `/`, `/solutions` and `/software`.

## Independent adversarial testing

A separate agent, given only the built site and a brief to break it, found no severe defects. Fast spins, erratic input, keyboard, idle, the clock and hover all held up. It found six edge cases, all now fixed and covered by the QA suite:

| Finding | Fix | Regression test |
|---|---|---|
| Resizing snapped the camera by up to 8385 units | On re-layout the scroll offset is remapped to the same segment and fraction | `resize: camera keeps its place` (largest frame jump is now about 177 units, from the change of 1:1 distance) |
| The page scrolled behind the inspect view | Wheel, touch and scroll keys are blocked while it is open | `inspect: page does not scroll behind the dialog` |
| Deep links were ignored on first load | The hash is applied once the journey has laid out | `deep link: #projects opens at Projects` |
| Back and forward lost the scroll position | Each history entry keeps its position (debounced on scroll), restored after layout | `back/forward: positions restored` |
| A first-visit hitch in each place | Progressive idle warming in small batches | Covered by the idle and profile frame checks |
| A small path kink on Data Solutions where a downward pan met a rising travel | Pans ease to rest at both ends | Covered by the reversal checks |

The remaining console warning (`THREE.Clock` deprecated) comes from React Three Fiber internals.

## Final measurements

All seven feel targets pass on all three routes (spring ω = 11).

Frame times, measured with nothing else using the GPU:

- p99 is 16.8 ms on every route at 1440×900 @1x and 1280×720 @2x.
- 2560×1440-class (@2x) runs have no frame over 20 ms.
- At 1440×900, three or four isolated long frames remain over a full 20 s scripted scroll on the homepage and Data Solutions, at worst 183 ms and 100 ms. They come from first visits to parts of the scene that the idle warmup had not yet reached.
