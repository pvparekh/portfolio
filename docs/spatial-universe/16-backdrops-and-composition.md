# Backdrops, composition and life

Feedback after the desktop release:

- Some places had sparse, empty backgrounds.
- Every backdrop should be unique and a step further.
- The planets should have more life.
- Inside Projects, the coloured lights under each project looked like stray spotlights. The section should read as one designed unit on approach, then become more granular project by project.
- It should look right on every screen size.

## One atmosphere, a motif per destination

`scene/shared/Atmosphere.tsx` replaces the old sky dome. Each destination's palette can name a `sky`:

- a motif;
- two colours;
- a strength;
- an organising direction (sun, focal point or galactic plane);
- a star density;
- a `ground` flag for worlds with a floor.

The backdrop is the void's base gradient, the same as before, plus that motif. The motif cross-fades with a smoothstep as you travel, so each backdrop holds while you are near its destination.

| Page | Destination | Motif | Idea |
|---|---|---|---|
| Portfolio | Origin | nebula (faint) | Leaves the hero almost as it was |
| | About | aurora | Two layers of curtains with sharp hems and fine striations |
| | Experience | dusk | A soft glow at the end of the colonnade, with drifting strata of lit cloud |
| | Projects | nebula | A domain-warped violet ceiling over the exhibition hall |
| | Skills | galaxy | A galactic band with clumping, a dust lane and a core |
| | Contact | dawn | A sun just under the horizon: corona, slow rays, banded warm haze |
| Data Solutions | Overview | streams | Streamlines of data with packets travelling along them |
| | The problem | storm | A slow ember storm (ridged, churning turbulence) |
| | Services | contours | A topographic survey of a shifting data terrain |
| | Delivery | confluence | Rivers of light converging, with pulses flowing inward |
| | Approach | ripples | Milestone rings expanding from below the horizon |
| | Products | nebula | Indigo and cyan |
| | Contact | dawn | |
| Software Solutions | Overview | blueprint | A measured grid on every wall, with a scanning sweep |
| | Opportunity | shards | Drifting Voronoi facets with luminous edges |
| | Services | circuit | Truchet circuit traces with signals running along them |
| | Work | hex | A hexagonal lattice crossed by waves of light |
| | Approach | ripples | |
| | Contact | dawn | |

### Why it is cheap

- **Half resolution.** The motif is painted into an offscreen target at half resolution (a third on the lite budget, at most 1280 px wide) and upscaled. Backdrops are soft, so the result looks the same for about a quarter of the fragment work; half-resolution FBM is a common practice for this reason.
- **Only what is needed.** Each page compiles only the motifs it uses. A motif is evaluated only while on screen: one at rest, two during a cross-fade.
- **Few octaves.** The noise is 3D value noise on the view direction, so there are no seams, with 3 to 4 octaves. Domain warping follows Quilez's f(p + fbm(p + fbm(p))) pattern.
- **Crisp stars.** Distant stars and a whisper of dither are added in the full-resolution composite, so stars stay pin sharp and dark gradients do not band.

Draw calls are unchanged (7 on the homepage). Steady-state p95 and p99 are 16.8 ms on all routes at 1440×900 and at 2560×1440 @2x.

## Projects: one exhibition, then each project

This follows the museum lighting hierarchy (Richard Kelly's layers, as used in ERCO's guidance for museums):

- **General light.** A single platform with an engraved double border, and a walkway line joining the three projects in reading order, with a soft light travelling along it. On approach the hall reads as one designed installation.
- **Focal light.** A neutral pool under each project. At the overview shot all three are equal. As you move into a project, its pool brightens and the others recede, handing off smoothly in real time.
- **Project colour as detail only.** A fine ring at each plinth and the screen edges, instead of a coloured wash on the floor. The point lights are neutral, with 12% of the accent, and the plinths are matte.

## About: a living planet

All of it is evaluated on the GPU, with no per-frame CPU work beyond uniforms:

- weather drifting over the surface;
- a terminator, with city lights on the night side that breathe like nodes on a network;
- sun glint on open water;
- a banded ring system arcing over the horizon;
- satellites crossing a low orbit;
- a moon that fades in on arrival.

## Experience: rhythm in the colonnade

- **Light inlays** on each monolith's inner face, with a slow wave of light travelling down the colonnade.
- **Pulses on the path rails**, running toward the roles.

## Screen sizes

Lateral shot offsets were fractions of the viewport width. That caused two problems:

- At 4:3 (1024×768) the Projects intro was pushed off screen.
- On ultrawide screens a panel was pulled far from its exhibit.

Offsets are now fractions of a composition frame no wider than about 16:9, clamped so the panel always stays fully on screen. Ultrawide keeps the same arrangement, centred, with more world around it.

## Panels at the screen edge

A panel's opacity depended only on its distance from the camera. A neighbouring panel at the edge of the frame therefore showed at full strength while half cut off; for example, the hero preview cards on both solutions pages peeked in clipped at the right edge. Panels now also fade by how much of them is horizontally on screen. The next shot's panel glides in from the edge instead of appearing chopped. The focused panel is always fully on screen, by the composition clamp above.

## Data and Software Solutions

- **Software services.** The modules beside each service were solid black blocks that half-intersected the reading panel. They are now translucent wireframes, placed clear of the panel and further back.
- **Software approach.** The assembling slabs sat directly behind the process panel, and their outlines crossed its text. They now form a plinth well below the panel.
- **Software hero.** The exploded interface layers stack directly behind the preview panel, in its own frame, with a scan line sweeping the deepest layer. They no longer float beside the hero text.
- **Data delivery.** The validation rings and data streams run below the reading line, so the nearest gate no longer collides with the panel.
- **Data services.** The lattice that poked into the nav was removed; the contour backdrop carries that section.

## Load time: shader compilation

The first build of the backdrop blocked the landing page's main thread for 7.9 s before the first frame. Bisecting one motif at a time showed the cost was D3D shader compilation (ANGLE on Windows) of computed noise inside loops:

| Motif | Compile cost |
|---|---|
| nebula | 3.2 s |
| aurora | 1.4 s |
| galaxy | 1.4 s |
| dawn | 1.2 s |
| dusk | 1.0 s |

Three fixes:

- **Texture noise.** Noise is now sampled from a 32³ random texture, using trilinear filtering on smoothstep-remapped coordinates. That is the same smooth value noise, for one fetch instead of eight hashes. `textureLod` keeps gradient instructions out of loops.
- **Compile in the background.** The backdrop is drawn only once its program has linked (`compileAsync`, parallel where the driver supports it). Until then its target is cleared.
- **Compile the right variant.** three.js keys programs by output target, because tone mapping and colour space differ. Compiling while the screen was bound produced a variant that was never used, so the real one compiled synchronously on first draw: a 1.3 s freeze just after load. It is now compiled with the offscreen target bound.

The result: WebGL is ready in about 2 s on every route, the same as before this work.

## A hitch found on the way

Arriving at Skills cost one 270 to 280 ms frame. The live site had it too. A trace showed GPU rasterization of the Skills panel. Removing elements one at a time pinned it on the six heading icons: inline SVGs rasterized inside the 3D-transformed panel. Giving them their own layer (`will-change: transform`) removes the hitch. The same fix applies to the Software hero preview, whose first paint moved into the hero's move once edge fading delayed it: 383 ms down to 117 ms. Smaller first-paint hitches of 50 to 83 ms remain when long text panels (the DOWC role) first appear.
