# 02 — Creative directions

Three distinct directions, all built from the identity verified in [00 §3.1](00-repository-audit.md#31-how-the-existing-streaks-actually-work-the-identity-to-evolve): hairline amber light moving left-to-right over near-black, a faint engineering grid, and a motorsport vocabulary (P1, GRID REF, telemetry, sectors S01–S06) that the site already uses.

No generic planets, nebulae or starfields. The "universe" metaphor is about **scale, continuity and travel**, not astronomy.

---

## Direction A — **SLIPSTREAM** (evolves the streaks directly)

### Creative thesis
The six streaks were always moving *past* something. Slipstream turns the page into the thing they move past: an immense, dark, slightly hazy volume in which thousands of amber filaments travel at different depths. Scrolling is forward travel through that volume. Each portfolio section is a **sector**: a place where the streams slow, bend and organize into a structure that expresses that section's content. Between sectors the streams speed up again. The site becomes a single continuous lap (Hero = grid, Contact = horizon). It reads as motorsport telemetry rendered as architecture of light, without a car or track ever appearing literally.

### Visual language
- **Filaments:** the original 1px gradient line, now a world-space ribbon with a hot white-amber core (`#FFE2A8`) fading to `#F59E0B` and transparent tails. Length stretches with velocity, as the old `scaleX(0.3 → 2.5)` did.
- **Depth through atmosphere:** exponential fog toward `#08080D`; far filaments desaturate toward warm grey and lose alpha; near ones are brighter, thicker and slightly defocused.
- **Ground:** the 68 px circuit grid becomes an infinite perspective floor that fades out within ~60 world units, so it reads as a horizon, not a tile pattern.
- **Sector structures:** built from the same filaments (no new materials): gates, rings, rails, ribbons, constellations. A single material language holds the whole site together.

### Opening scene
Black, then the grid floor fades up from the vanishing point; the first filaments ignite at the horizon and race toward and past the viewer on several depth layers. Some pass inches from the lens at the screen edges (soft, large, fast); others crawl across the far distance. **PARTH / PAREKH** sits dead centre as a lit typographic plate, with filaments passing both behind and in front of it. The "P1 / GRID REF" marker becomes a world-space sign at the right. The telemetry strip stays a crisp DOM HUD at the bottom.

### Camera behavior
Forward dolly along a gently curving spline (centripetal Catmull-Rom). Mostly level with ≤3° bank in curves. Longer focal length (≈40–50 mm equivalent) while content is on screen, widening to ≈28 mm briefly in transit to sell speed. **The camera dwells while text is readable and moves between sections.** No orbiting and no constant rotation.

### Navigation metaphor
Sectors on a lap: S0 Grid (Hero) → S1 About → S2 Experience (a straight with one gate per employer, so time is distance) → S3 Projects (three systems, each tinted by its existing accent color) → S4 Skills (the widest shot, six lanes seen from above) → S5 Contact (the horizon). Nav dropdown indices already read "01…05", which matches.

### Lighting and material
Pure emissive plus additive blending and a single HDR bloom pass on desktop. One warm key "sun" at the vanishing point (the existing radial glow, now volumetric). No PBR models, no textures except a tiny gradient LUT and a noise texture. Cheap to render and very hard to make look like a stock template, because everything comes from one bespoke shader.

### Typography
DOM text stays the source of truth. The hero name gets a WebGL twin (SDF text in Space Grotesk 700), pixel-aligned to the DOM `h1`, so filaments can pass in front of and behind it and their light can graze its edges. Everything else is DOM, laid over the canvas with a soft shader-side "reading scrim" (darkening and filament density falloff behind content columns).

### Interaction model
- Native scroll drives travel; scroll **velocity** lengthens and brightens filaments (the visitor feels their own speed).
- The pointer gives a subtle parallax (camera target offset ≤0.6°) and a faint wake that bends nearby filaments.
- Hovering a project card tints the local stream with that project's accent.
- Nav jumps fly the camera there at speed (compressed transit), with no slow forced tour.

### Desktop
Full field (≈4–6k filament instances), bloom, WebGL name, pointer wake, DPR ≤ 2.

### Mobile
Same composition and camera script, ≈800–1,200 filaments, no post-processing (glow is baked into the filament shader), DPR ≤ 1.5, no pointer effects, DOM name only. Portrait framing uses a narrower, taller sector composition (streams run more vertically in the distance).

### Feasibility, performance, risks
- **Feasibility: high.** One instanced draw call for filaments, one for the grid, one or two for sector structures. Everything is procedural, with no 3D asset pipeline.
- **Performance: excellent per visual impact.** Fill-rate (additive overdraw plus bloom) is the main cost; it is controlled by instance count, DPR and a half-resolution bloom.
- **Risks:** (1) It could slide into "hyperspace screensaver" if speed is overused, so speed is reserved for transits and velocity response is capped. (2) Readability over moving light, handled by the scrim, density falloff and measured contrast gates. (3) Sector structures must stay abstract enough not to look like infographics pretending to be data.

---

## Direction B — **MONOLITH ATLAS** (architectural light)

### Creative thesis
The portfolio is a sequence of monumental, quiet architectural spaces (galleries, colonnades, a vault), each built from dark stone-like volumes cut by amber light. The streaks become **light leaking through architecture**: slits, edges and beams. Scrolling walks the visitor through rooms. It feels like premium architectural visualization (Tadao Ando meets an F1 museum at night).

### Visual language and scenes
Monolithic slabs with subtle roughness, raking light, volumetric beams, and polished-floor reflections. Hero: the name is carved into a colossal slab, with light streaks sweeping across its face. Experience: a colonnade with one bay per employer. Projects: three alcoves. Skills: a hexagonal atrium. Contact: an open doorway onto a lit horizon.

### Camera, lighting, typography
Slow, weighted dolly and crane moves with occasional 90° turns between rooms. Baked lighting (lightmaps) is needed for quality, plus SSR or planar reflections, which are expensive. Typography is engraved and projected onto surfaces, which is beautiful but hurts the readability of long content.

### Mobile
Requires prerendered stills or video per room; real-time would mean heavy downgrades.

### Feasibility, risks
- **Feasibility: medium-low** for a solo-maintained site: it needs a modeling and baking pipeline (Blender → glTF + KTX2 lightmaps), 5–15 MB of assets, and long iteration loops.
- **Strength:** the most "premium" stills.
- **Weaknesses:** departs furthest from the current streak identity (streaks become secondary); risks the generic "dark luxury brand" look; long text is hard to integrate into architectural space; heavy on mobile; slower to load (in tension with the recruiter 15-second goal).

---

## Direction C — **SIGNAL TERRAIN** (data topography)

### Creative thesis
The world is a vast terrain made of light samples, like a telemetry trace extruded into landscape. The streaks are **signals flowing over the terrain** along contour lines. Each section is a region of the map with its own topography: flat calm plains for reading, ridges and valleys during transits. Fits a data engineer: information as landscape.

### Visual language and scenes
A point and line field (GPU particles on a displaced plane), contour lines in amber, and signal pulses racing along them. Hero: the camera hovers low over the terrain at dawn, with the name standing on the horizon. Experience: a long valley whose ridges mark employers. Projects: three distinct "biomes" (a circuit-shaped ridge for Formula Vision, a two-stage filter basin for Review Bot, sorting terraces for AetherFlow). Skills: a contour map seen from directly above. Contact: the plain ends at a sea of light.

### Camera, lighting, typography
Low-altitude flyover with height changes and smooth banking. Lighting is purely emissive. Typography is DOM-only, with terrain flattening under text columns.

### Mobile
Lower vertex counts and fewer contour lines; strong viability.

### Feasibility, risks
- **Feasibility: medium-high.** A vertex-displaced plane plus line rendering; contour extraction can be done in the fragment shader.
- **Strength:** an original, intellectually coherent link to data work.
- **Weaknesses:** abstract terrain flyovers are a known WebGL trope ("synthwave landscape"); motion sickness risk from altitude changes; the streak identity becomes indirect (lines on ground rather than through space); the name loses its centrality.

---

## Evaluation

Scored 1–5 (5 = best). Weighted toward continuity with the current identity and content clarity, per the brief.

| Criterion (weight) | A Slipstream | B Monolith Atlas | C Signal Terrain |
|---|---|---|---|
| Originality (×2) | 4 | 3 | 4 |
| Visual impact (×2) | 4 | 5 | 4 |
| Continuity with current streak identity (×3) | **5** | 2 | 3 |
| Content clarity / readability (×3) | **5** | 2 | 4 |
| Engineering feasibility for a solo-maintained site (×2) | **5** | 2 | 4 |
| Mobile viability (×2) | **5** | 2 | 4 |
| Preservation of existing content and routes (×2) | 5 | 3 | 5 |
| **Weighted total (/80)** | **77** | **40** | **63** |

## Recommendation: **A, Slipstream**, borrowing two things from C

Slipstream is the only direction in which the existing hero is unmistakably the seed of the whole experience. Someone who knew the old site would say "the lines came alive," not "they redesigned it." It puts the visual budget where it is cheapest to render and hardest to imitate (one bespoke filament shader), keeps DOM text fully readable, and scales down to phones without changing the story.

From Signal Terrain we borrow **(1)** the idea that each destination's structure should encode that section's real content (employer gates, three project systems, six skill lanes), and **(2)** the contour/flow vocabulary that becomes Data Solutions' identity (see [05](05-solutions-pages.md)). From Monolith Atlas we borrow only its **restraint**: long dwells, slow weighted moves, and darkness as a material.

Rejected explicitly: literal planets and stars, glass cards floating in particles, camera orbits around text, scroll-jacked "slides", and 3D models of cars or tracks.
