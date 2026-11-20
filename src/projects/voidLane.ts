/*
 * Void Lane: copy and media for the featured game showcase.
 *
 * Every number below is measured and documented in the game's own repository
 * (docs/status/SESSIONS.md, docs/status/STATUS.md, docs/adr, tools/size-budget,
 * reports/perf). The repository is private; the playtest build is public on
 * itch.io but password-protected, so its link sits beside an email request.
 */

import type { LightboxItem } from '../gallery/types';

export interface GalleryMedia {
  /** File stem under /projects/void-lane/ (stem.webp, stem-thumb.webp, stem-full.webp). */
  stem: string;
  kind: 'image' | 'video';
  alt: string;
  caption: string;
  /** Short label shown on the filmstrip and in the lightbox. */
  label: string;
}

const BASE = '/projects/void-lane/';
export const VL_ASPECT = 16 / 9;

const EARLY_ACCESS_EMAIL = 'pvparekh14@gmail.com';

export const VOID_LANE = {
  id: 'void-lane',
  name: 'Void Lane',
  tagline: 'Anti-gravity racer, headed to Steam',
  topline: ['01 / FEATURED BUILD', 'REAL-TIME 3D GAME + AI AGENT STUDIO'] as const,
  lead: 'A Mach-speed racing game, built in 20 days by a studio of AI agents I designed, planned and directed.',
  description:
    'Three worlds, five tracks, 14 craft and 9 rival pilots, every shape and light generated in code. A lane gate called the throat warps the race from one planet to the next, and a deterministic simulation replays identically on every major browser engine. Built for the web and headed to Steam, it runs smoothly on everyday hardware: playtested through itch.io on a MacBook and a mid-range laptop.',
  proofPoints: [
    {
      label: 'Engineering',
      text: 'Deterministic 120 Hz simulation: identical results on 100,000 test vectors across Chromium, Firefox and WebKit, locked in by golden replay tests.',
    },
    {
      label: 'Performance',
      text: 'Fast on any machine: a 5.6 ms median frame, with quality tiers and dynamic resolution that hold it smooth from a mid-range laptop to a 3440x1440 display, inside a 459 KB initial download.',
    },
    {
      label: 'Leadership',
      text: 'Run like a real studio: I lead 8 to 10 hours of sprint planning per cycle, then a Lead, an Experience Director and a Technical Director turn it into specs for seven build agents working in parallel git worktrees.',
    },
    {
      label: 'Scale',
      text: 'Built to grow without rewrites: a documentation base the agents write and maintain (design specs, architecture decisions, signed acceptance criteria), so new worlds, craft and features land without reworking the core. 1,945 commits and 2,400+ tests, and no change merges until they pass.',
    },
  ],
  studioCaption: 'HOW THE STUDIO SHIPS',
  studio: [
    { code: 'S1', label: 'Plan the sprint', detail: 'I set goals and priorities and build the research base the studio works from.' },
    { code: 'S2', label: 'Prioritize', detail: 'The Lead and I rank the work and commit what earns build time.' },
    { code: 'S3', label: 'Signed spec', detail: 'The Experience and Technical Directors sign measurable acceptance criteria.' },
    { code: 'S4', label: 'Build', detail: 'Seven build agents work in their own worktrees; a hook blocks any turn that ends on failing tests.' },
    { code: 'S5', label: 'Verify', detail: 'A fresh-context verifier and real-browser captures. Compiling is not evidence.' },
    { code: 'S6', label: 'Play', detail: 'The Experience Director plays the merged build and returns PASS or REJECT.' },
  ],
  tech: ['TypeScript', 'three.js', 'WebGL2', 'GLSL', 'Web Audio', 'Web Workers', 'Vite', 'Vitest', 'Playwright', 'Claude Code agents'],
  status: 'In development, headed to Steam. Playtest builds on itch.io.',
  build: {
    label: 'Play Build 1 on itch.io',
    href: 'https://pvparekh.itch.io/void-lane',
  },
  earlyAccess: {
    note: 'Build 1 is in early access and password-protected while I playtest.',
    label: 'Email me for the password',
    href: `mailto:${EARLY_ACCESS_EMAIL}?subject=${encodeURIComponent('Void Lane Build 1 password')}&body=${encodeURIComponent("Hi Parth, I'd like to try Void Lane Build 1. Could you send me the password?")}`,
  },
};

/**
 * Gallery order is the story: Halcyon Reach, the throat, then each world, then speed,
 * then the craft and the interface. The first three also stand in the 3D
 * exhibition. Filled from the capture manifest (C:\Dev\void-lane-media).
 */
export const VOID_LANE_MEDIA: GalleryMedia[] = [
  {
    stem: 'halcyon-ring-world', kind: 'image', label: 'Halcyon Reach',
    caption: 'Halcyon Reach: a 900 km ring world, where the horizon goes up.',
    alt: 'Looking up from the lane: green tiled farmland curves up and over the sky like the inside of a giant ring, tall segmented spires and a dark skyline below.',
  },
  {
    stem: 'throat-fold', kind: 'image', label: 'The throat',
    caption: 'Deep in the throat, the next world arrives before the tunnel ends.',
    alt: 'A racer in a dark ring tunnel streaked with speed lines, as a bright green crescent of ring-world farmland breaks through the tunnel wall ahead.',
  },
  {
    stem: 'cinder-ring-climb', kind: 'image', label: 'Cinder Vault',
    caption: 'Cinder Vault: the forge never cools, and neither does the lane.',
    alt: 'A white anti-gravity racer follows a cyan-edged dark lane that banks and climbs into a ring gate, orange embers trailing ahead and a cracked basalt canyon wall glowing to the right.',
  },
  {
    stem: 'first-gate', kind: 'image', label: 'The First Lane',
    caption: 'The First Lane: the world gate opens under a gas giant.',
    alt: 'A racer sweeps through a cyan-edged curve toward translucent concentric gate rings, a huge banded violet gas giant filling the left of the sky.',
  },
  {
    stem: 'throat-hud', kind: 'image', label: '3,240 km/h',
    caption: 'Inside the throat the readout jumps to 3,240 km/h, times thirteen.',
    alt: 'Inside a warp tunnel of concentric blue rings, a racer rides a cyan lane while the broadcast HUD reads 3,240 km/h x13 and a rival radios: Last lap. Now I spend.',
  },
  {
    stem: 'clip-throat', kind: 'video', label: 'Clip: world gate',
    caption: 'One gate, two worlds, seven seconds. Recorded from the game, sped up 1.5x.',
    alt: 'A racer enters a ring-lined warp tunnel as the HUD jumps to 3,240 km/h x13, green farmland breaks through the walls, and it exits under a ring world curling overhead.',
  },
  {
    stem: 'halcyon-pack', kind: 'image', label: 'Spoke and Spindle',
    caption: 'Spoke and Spindle: rings, rivals, and a sky made of fields.',
    alt: 'A white racer charges toward a dark ring gate with two rivals alongside, a towering loop of lane and pale green ring-world farmland rising behind.',
  },
  {
    stem: 'overdrive-release', kind: 'image', label: 'Overdrive',
    caption: 'Overdrive fires: a shockwave, a field-of-view punch, and the canyon folds to a line.',
    alt: 'A racer bursts forward at the moment of Overdrive, a pale shockwave ring expanding around it and white speed lines streaking toward a cyan ring gate on a climbing lane.',
  },
  {
    stem: 'clip-overdrive', kind: 'video', label: 'Clip: Overdrive',
    caption: 'Overdrive through the forge, captured frame by frame from the simulation.',
    alt: 'A racer climbs a banked lane, a shockwave ring bursts around it as Overdrive fires, it flashes through a cyan ring gate and streaks into a long canyon of gantries.',
  },
  {
    stem: 'overdrive-hud', kind: 'image', label: 'Broadcast HUD',
    caption: '370 km/h, live gaps, minimap and Overdrive state: the broadcast keeps up.',
    alt: 'Gameplay with the broadcast HUD: position 4 of 8, a live gap ticker, lap timer, minimap and a speed panel reading 370 km/h with Overdrive active, climbing into a glowing ring gate.',
  },
  {
    stem: 'the-pour', kind: 'image', label: 'The Pour',
    caption: 'Under The Pour, the whole field runs on borrowed light.',
    alt: 'A low wide view down a dark grated lane beneath a huge glowing overhead pour structure, a pack of racers and a spray of orange embers in the distance.',
  },
  {
    stem: 'cinder-pack', kind: 'image', label: 'The pack',
    caption: 'Four machines, one ember trail.',
    alt: 'A front three-quarter view of four racers in tight formation on a dark lane, each shedding streams of orange embers, a canyon wall and a distant ring gate behind.',
  },
  {
    stem: 'dimmed-freight', kind: 'image', label: 'Dimmed Freight',
    caption: 'Lights out under a ringed giant.',
    alt: 'A racer chases the pack seconds after the start, rivals on both sides, under a violet sky with a ringed gas giant, a lightning bolt and an overhead freight rail.',
  },
  {
    stem: 'clip-pack', kind: 'video', label: 'Clip: the pack',
    caption: 'The pack, seen from the trackside broadcast camera.',
    alt: 'The camera sweeps around a pack of racers trailing colored light on a lane, green ring-world fields and tall spires behind.',
  },
  {
    stem: 'coronet', kind: 'image', label: 'Coronet',
    caption: 'Coronet, the champion’s machine. One of 14 craft, every one modeled in code.',
    alt: 'Close rear three-quarter view of a long white racer with twin glowing engines on a banked lane, ring gates ahead and an enormous ringed gas giant behind.',
  },
  {
    stem: 'indev-worlds', kind: 'image', label: 'In development',
    caption: 'In development: Tidefall, the sea that glows back, and Glass Steppe, the desert that sings.',
    alt: 'Two stacked panels: above, a racer skims a glowing royal-blue sea lane past a white spray plume; below, a racer crosses a dark lane under a mauve sky past tall crystal spires.',
  },
  {
    stem: 'title', kind: 'image', label: 'Title',
    caption: 'Light is the only thing that exists in the void.',
    alt: 'The Void Lane title screen: a white wordmark with a cyan slash over a dimmed night lane, subtitle Anti-Gravity Grand Prix.',
  },
];

export const mediaItem = (m: GalleryMedia): LightboxItem => ({
  src: `${BASE}${m.stem}.webp`,
  srcSet: m.kind === 'image' ? `${BASE}${m.stem}.webp 1600w, ${BASE}${m.stem}-full.webp 2560w` : undefined,
  width: 1600,
  height: 900,
  alt: m.alt,
  caption: m.caption,
  label: m.label,
  video: m.kind === 'video' ? `${BASE}${m.stem}.webm` : undefined,
  poster: m.kind === 'video' ? `${BASE}${m.stem}.webp` : undefined,
});

export const thumbSrc = (m: GalleryMedia) => `${BASE}${m.stem}-thumb.webp`;
export const displaySrc = (m: GalleryMedia) => `${BASE}${m.stem}.webp`;
export const VOID_LANE_ITEMS = () => VOID_LANE_MEDIA.map(mediaItem);
