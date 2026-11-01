import type { JourneyDefinition, PanelSpec } from '../core/types';
import type { Vec3 } from '../core/math';

/*
 * The homepage universe. World units are CSS pixels (a panel read at 1:1 is
 * its authored size). Destinations are tens of thousands of units apart so
 * travel reads as real distance; each has its own environment in the scene.
 */
export const ORIGIN: Vec3 = [0, 0, 0];
export const ABOUT: Vec3 = [-14000, -2600, -26000];
export const EXPERIENCE: Vec3 = [16000, 1600, -60000];
export const PROJECTS: Vec3 = [0, 6000, -98000];
export const SKILLS: Vec3 = [-20000, 9000, -134000];
export const CONTACT: Vec3 = [0, 13000, -170000];

const at = (base: Vec3, offset: Vec3): Vec3 => [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]];

/** Offset expressed in a yawed object's local frame (x right, y up, z toward its viewer). */
export const local = (base: Vec3, yawDeg: number, [x, y, z]: Vec3): Vec3 => {
  const r = (yawDeg * Math.PI) / 180;
  return [base[0] + x * Math.cos(r) + z * Math.sin(r), base[1] + y, base[2] - x * Math.sin(r) + z * Math.cos(r)];
};

export const ROLE_SPACING = 6400;
/** Experience stops: the current employer alone, earlier companies in pairs (see EXPERIENCE_GROUPS). */
export const ROLE_COUNT = 2;

/** The current employer stands to one side of the colonnade; the paired stop faces down the path. */
export const rolePanels: PanelSpec[] = Array.from({ length: ROLE_COUNT }, (_, i) => ({
  id: `role-${i}`,
  destination: 'experience',
  position: at(EXPERIENCE, [i === 0 ? -1300 : 0, 0, -(i + 1) * ROLE_SPACING]),
  yaw: i === 0 ? 20 : 0,
  width: i === 0 ? 820 : 1180,
}));

/** Project exhibits: an info panel plus WebGL displays positioned in the panel's local frame. */
export const EXHIBITS = {
  fv: { info: at(PROJECTS, [-7600, 0, -1800]), yaw: 16, accent: '#E8002D' },
  bot: { info: at(PROJECTS, [400, 0, -5600]), yaw: 0, accent: '#4ADE80' },
  aether: { info: at(PROJECTS, [8600, 0, -2600]), yaw: -16, accent: '#8B5CF6' },
} as const;

export const portfolioJourney: JourneyDefinition = {
  panels: [
    { id: 'origin', destination: 'origin', position: ORIGIN, yaw: 0, width: 1040 },
    { id: 'about-bio', destination: 'about', position: ABOUT, yaw: 14, width: 620 },
    { id: 'about-profile', destination: 'about', position: at(ABOUT, [2700, 120, -1300]), yaw: -10, width: 660 },
    { id: 'exp-intro', destination: 'experience', position: EXPERIENCE, yaw: 0, width: 760 },
    ...rolePanels,
    { id: 'projects-intro', destination: 'projects', position: at(PROJECTS, [0, 900, 4200]), yaw: 0, width: 760 },
    { id: 'fv-info', destination: 'projects', position: EXHIBITS.fv.info, yaw: EXHIBITS.fv.yaw, width: 600 },
    { id: 'fv-architecture', destination: 'projects', position: local(EXHIBITS.fv.info, EXHIBITS.fv.yaw, [1720, 0, -260]), yaw: 6, width: 420 },
    { id: 'bot-info', destination: 'projects', position: EXHIBITS.bot.info, yaw: EXHIBITS.bot.yaw, width: 600 },
    { id: 'aether-info', destination: 'projects', position: EXHIBITS.aether.info, yaw: EXHIBITS.aether.yaw, width: 600 },
    { id: 'skills', destination: 'skills', position: SKILLS, yaw: 0, width: 1120 },
    { id: 'contact', destination: 'contact', position: CONTACT, yaw: 0, width: 640 },
  ],
  destinations: [
    {
      id: 'origin', label: 'Origin', anchor: 'hero', center: ORIGIN, approach: [0, 600, 9000],
      shots: [{ panel: 'origin' }],
      palette: { background: '#04050A', atmosphere: '#0A1022', accent: '#F59E0B', sky: { motif: 'nebula', a: '#18245A', b: '#3B2466', strength: 0.4 } },
    },
    {
      id: 'about', label: 'About', anchor: 'about', center: ABOUT, approach: at(ABOUT, [7000, 9000, 15000]),
      shots: [{ panel: 'about-bio', offsetX: -0.14 }, { panel: 'about-profile', offsetX: 0.1 }],
      palette: { background: '#030B10', atmosphere: '#0E3A44', accent: '#67E8F9', sky: { motif: 'aurora', a: '#22D3AE', b: '#7C83F2', strength: 1 } },
    },
    {
      id: 'experience', label: 'Experience', anchor: 'experience', center: EXPERIENCE, approach: at(EXPERIENCE, [0, 3200, 15000]),
      shots: [{ panel: 'exp-intro' }, ...rolePanels.map((p, i) => ({ panel: p.id, offsetX: i === 0 ? -0.12 : 0 }))],
      palette: { background: '#05070B', atmosphere: '#1A2230', accent: '#CBD5E1', sky: { motif: 'dusk', a: '#9CC3F0', b: '#3B4D6B', strength: 1, ground: true, toward: [0.05, 0.16, -1] } },
    },
    {
      id: 'projects', label: 'Projects', anchor: 'projects', center: PROJECTS, approach: at(PROJECTS, [-3000, 5200, 19000]),
      shots: [
        { panel: 'projects-intro', offsetX: -0.17 },
        { panel: 'fv-info', offsetX: -0.22 },
        { panel: 'fv-architecture', offsetX: 0.26 },
        { panel: 'bot-info', offsetX: -0.22 },
        { panel: 'aether-info', offsetX: -0.22 },
      ],
      palette: { background: '#07050E', atmosphere: '#1C1236', accent: '#A78BFA', sky: { motif: 'nebula', a: '#4C2C9E', b: '#C084FC', strength: 0.75, ground: true } },
    },
    {
      id: 'skills', label: 'Skills', anchor: 'skills', center: SKILLS, approach: at(SKILLS, [8000, 6000, 16000]),
      shots: [{ panel: 'skills' }],
      palette: { background: '#04060E', atmosphere: '#141A3A', accent: '#93C5FD', sky: { motif: 'galaxy', a: '#4B6BD6', b: '#C7D6FF', strength: 1, toward: [0.32, 0.9, 0.28], stars: 1.6 } },
    },
    {
      id: 'contact', label: 'Contact', anchor: 'contact', center: CONTACT, approach: at(CONTACT, [0, 2400, 16000]),
      shots: [{ panel: 'contact', dwell: 0.15 }],
      palette: { background: '#05040A', atmosphere: '#2A1A0C', accent: '#F59E0B', sky: { motif: 'dawn', a: '#F59E0B', b: '#7C2D12', strength: 0.3, toward: [0, -0.1, -1] } },
    },
  ],
};
