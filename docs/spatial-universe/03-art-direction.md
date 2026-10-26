# 03 — Recommended art direction: SLIPSTREAM

> One sentence: **the six amber speed lines become an entire luminous slipstream you travel through, and every section of the portfolio is a place where that stream organizes itself around real content.**

## 1. Non-negotiable art principles

1. **One material.** Everything luminous is made of the filament. Gates, rings, rails and constellations are filaments arranged differently. No glass, chrome, planets, nebulae, lens-flare sprites, or stock HDRIs.
2. **Darkness is the canvas.** At least 70 % of any frame is within 4 % luminance of `#08080D`. Light earns attention by being rare.
3. **Motion has a job.** Speed means *transit between ideas*. Stillness means *read this*. The camera never moves meaningfully while a paragraph is centered on screen.
4. **Horizontal heritage.** Dominant filament flow stays left-to-right in screen space (the original direction), even as it gains depth. Forward travel is expressed by filaments streaming outward from the vanishing point with a rightward bias, never as a symmetric "warp tunnel".
5. **The name is the anchor.** PARTH PAREKH remains the largest, most legible object of the opening and keeps its existing amber "PAR".
6. **Content is DOM.** Real text, real links and real focus order, always. WebGL is atmosphere and spatial structure, never the only carrier of information.
7. **Evidence-honest.** Sector structures *gesture* at real content (three employers, five pipeline steps, six skill groups). They never display invented metrics, fake dashboards or fake data.

## 2. Palette

| Token | Value | Use |
|---|---|---|
| `--void` | `#08080D` (existing `--bg-0`) | Background, fog color |
| `--void-lift` | `#0D0D15` (existing `--bg-1`) | Far haze band at horizon |
| `--amber` | `#F59E0B` (existing `--accent`) | Filament body, brand accents |
| `--amber-core` | `#FFE2A8` | Hot filament core (HDR > 1.0 on desktop, feeds bloom) |
| `--amber-ember` | `#B45309` | Far, cooling filaments; atmospheric falloff |
| `--haze` | `#1A1610` | Warm volumetric glow near the vanishing point |
| `--steel` | `#94A3B8` (existing `--text-2`) | Very sparse cool filaments (≤5 %) for contrast and depth |
| Project accents | `#E8002D` / `#4ADE80` / `#8B5CF6` (existing in `PROJECTS`) | Local stream tint, Projects sector only |
| Data Solutions accent | amber + `#38BDF8` at ≤8 % share | "Validated" lanes after the confluence gate |
| Software Solutions accent | amber + `#E2E8F0` structural white | Assembled module edges |

The colors were chosen so that no new hue competes with amber on the homepage. The project accents finally become visible in a meaningful place: they already exist in the data (`accent`, `glow`) but are barely used today.

## 3. Typography

- **Display:** Space Grotesk 700, unchanged. Hero name `clamp(3.8rem, 11.5vw, 9.5rem)`, line-height 0.9, tracking −0.01em (very slightly tighter than today so the WebGL twin reads as a solid slab).
- **WebGL hero twin:** troika SDF text using the Space Grotesk 700 **.woff or .ttf** file (troika does not read .woff2), self-hosted in `/public/fonts/`. `sdfGlyphSize` 128 for the hero only. Restricted `characters="PARTHEK"`. Material: near-white `#F1F5F9` face with an edge term lit by nearby filaments (screen-space light accumulation), and the amber "PAR" emissive.
- **Body / labels:** Inter and JetBrains Mono unchanged. Section kickers ("— PROJECTS —") gain a sector code prefix where natural (`S3 · PROJECTS`), drawn from the existing Skills "S01" vocabulary. This is presentation only; heading text is unchanged.
- **Readability rules:** body copy never sits over a filament brighter than 18 % luminance within 48 px of glyphs (enforced by the reading scrim, see storyboard). Minimum contrast 4.5:1 is measured against the *brightest* pixel behind the text box during automated screenshot QA.

## 4. Composition and camera grammar

- **Vanishing point:** slightly above center (y ≈ 0.42 of the viewport) on desktop; at 0.36 on portrait mobile so the name sits over the densest light.
- **Lenses:** 45 mm-equivalent (vertical FOV ≈ 30°) for dwell shots, 28 mm (≈ 46°) at peak transit, interpolated with velocity and transit phase. Changing FOV with speed is the "dolly-zoom whisper" that sells acceleration without spinning.
- **Allowed moves:** dolly (forward/back), truck/pedestal (lateral/vertical slide), slow crane up at Skills (the one overview), ≤3° bank in curves, ≤0.6° pointer parallax.
- **Banned moves:** orbit around content, continuous rotation, roll > 3°, zoom-punches, camera shake, any move during a dwell plateau beyond 0.5 world units of drift.
- **Easing:** camera pose is a pure function of scroll position (deterministic forward and back), smoothed by a critically damped spring (λ ≈ 6–8 /s) so a trackpad flick feels weighty, not jittery.

## 5. Motion signature

| Element | Behavior |
|---|---|
| Idle filaments | Always flowing at base speed `v0` (≈ the original 3.3–6.2 s screen crossing), so the scene is alive at rest |
| Scroll velocity | Adds speed and length (`length *= 1 + k·|v|`, capped at 2.5×, the original `scaleX` max) and brightens the core by ≤30 % |
| Transit | Streams accelerate, FOV widens, the grid floor scrolls, sector structure dissolves into free filaments |
| Arrival | Streams decelerate over ~0.4 viewport of scroll and "lock" into that sector's structure; FOV narrows; scrim fades in |
| Pointer | Gentle wake bending filaments within ~2 world units; camera target offset ≤0.6° |
| Pause | A visible **Motion** toggle (HUD, persisted) freezes filaments and the camera (WCAG 2.2.2) |

## 6. What it should feel like (and not)

**Should:** a night-time F1 onboard shot rendered by a lighting designer; Apple-grade restraint in pacing; a museum where light is the exhibit.

**Should not:** a Windows screensaver, a crypto landing page, a synthwave grid, a "Star Wars jump", or a portfolio template with a particle background.

## 7. Visual references

Concrete references and what each contributes are in [01-research-dossier.md](01-research-dossier.md). In short: Igloo Inc and Lusion for scroll-coupled cinematic camera paths and transitions; Apple for pacing and dwell-versus-transit; Active Theory and Immersive Garden for a single coherent material world; Codrops "Infinite Lights" for the light-trail-in-depth technique; Stripe and GitHub engineering blogs for performance discipline on hero WebGL.
