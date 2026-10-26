import { AMBER, Form, formation, free, station, type Station, type WorldBuilder } from './types';

/*
 * SLIPSTREAM: the homepage lap (docs/spatial-universe/04-storyboard.md).
 * Travel is along -Z. Structures are derived from registered DOM anchors,
 * so the gate count always equals the rendered role count.
 */

// Accent values duplicated from PROJECTS in src/App.tsx (the scene never imports content).
const FV_RED = '#E8002D';
const BOT_GREEN = '#4ADE80';
const AETHER_VIOLET = '#8B5CF6';
const STEEL = '#94A3B8';

const ROLE_START_Z = -260;
const ROLE_SPACING = 26;

export const buildPortfolio: WorldBuilder = anchors => {
  const has = (id: string) => anchors.some(anchor => anchor.id === id);
  const roles = anchors.filter(anchor => anchor.id.startsWith('role:'));
  const skills = anchors.filter(anchor => anchor.id.startsWith('skill:')).map(anchor => anchor.id);
  const stations: Station[] = [];

  if (has('hero')) {
    stations.push(station('hero', [0, 1.7, 9], [0, 2.0, -60], free, {
      fov: 30, density: 0.32, speed: 1, scrim: 0.5, haze: 1, intensity: 0.6,
      // Portrait: pitch down slightly so the horizon sits higher, behind the name.
      portrait: { target: [0, 1.25, -60], density: 0.55, intensity: 0.7 },
    }));
  }

  if (has('about')) {
    stations.push(station('about', [0, 2.0, -116], [0, 2.1, -140],
      formation(Form.ring, 'about-halo', [0, 2.3, -142], [7.2, 1.0, 0.035, 0.9], [1.6, 0, 0, 0], undefined, { share: 0.3 }),
      { fov: 32, density: 0.22, speed: 0.6, scrim: 0.8, haze: 1.25, intensity: 0.4, formAlpha: 0.5 }));
  }

  if (roles.length) {
    const current = roles.findIndex(role => role.meta.current === true);
    const gates = formation(Form.gates, 'experience-gates', [0, 0.05, ROLE_START_Z - 9],
      [roles.length, 15, 7.6, ROLE_SPACING], [current, 2.4, 0.05, 0.22], undefined,
      { share: 0.36, highlight: roles.map(role => role.id) });
    roles.forEach((role, i) => {
      const z = ROLE_START_Z - i * ROLE_SPACING;
      stations.push(station(role.id, [0, 1.85, z], [0, 2.0, z - 30], gates,
        { fov: 33, density: 0.22, speed: 0.75, scrim: 0.9, intensity: 0.4, formAlpha: 0.4 }));
    });
  }

  if (has('project:fv')) {
    stations.push(station('project:fv', [-2.5, 2.4, -640], [-1.0, 1.6, -668],
      formation(Form.ribbon, 'fv-ribbon', [2, 0.35, -676], [15, 8, 0.03, 5], [0, 0.08, 2.4, 0], undefined,
        { share: 0.33, progressPrefix: 'fv-step:', highlight: ['project:fv'] }),
      { fov: 34, density: 0.25, scrim: 0.86, tint: FV_RED, tintMix: 0.45, intensity: 0.45, formAlpha: 0.65 }));
  }
  if (has('project:bot')) {
    stations.push(station('project:bot', [2.5, 2.0, -720], [1.0, 1.9, -745],
      formation(Form.twoPass, 'bot-two-pass', [1.0, 0.9, -752], [6, 2.2, 4.5, 0.06], [1.8, 0.28, 0, 0], undefined,
        { share: 0.33, highlight: ['project:bot'] }),
      { fov: 34, density: 0.25, scrim: 0.86, tint: BOT_GREEN, tintMix: 0.3, intensity: 0.45, formAlpha: 0.55 }));
  }
  if (has('project:aether')) {
    stations.push(station('project:aether', [-1.5, 2.0, -790], [-0.5, 1.8, -815],
      formation(Form.lanes, 'aether-lanes', [-0.5, 0.15, -820], [4, 1.4, 26, 0.05], [1, 0, 0, 0], [0, 0.45, 0, 0],
        { share: 0.33, highlight: ['project:aether'] }),
      { fov: 34, density: 0.25, scrim: 0.86, tint: AETHER_VIOLET, tintMix: 0.32, intensity: 0.45, formAlpha: 0.6 }));
  }

  if (has('skills')) {
    stations.push(station('skills', [0, 46, -840], [0, 0, -884],
      formation(Form.lanes, 'skill-lanes', [0, 0.35, -884], [Math.max(skills.length, 6), 4.2, 120, 0.04], [0, 0, -1, 0], [0, 0.06, 0, 0],
        { share: 0.39, highlight: skills }),
      { fov: 38, density: 0.2, speed: 0.8, scrim: 0.82, haze: 0.4, tint: STEEL, tintMix: 0.08, intensity: 0.35, formAlpha: 0.6,
        portrait: { position: [0, 34, -846], target: [0, 0, -884] } }));
  }

  if (has('contact')) {
    stations.push(station('contact', [0, 1.4, -990], [0, 2.6, -1400],
      formation(Form.converge, 'horizon', [0, 0, -996], [18, 90, 0.012, 0], [0, 0, 0, 0], undefined, { share: 0.17 }),
      { fov: 30, density: 0.16, speed: 0.3, scrim: 0.82, haze: 1.6, tint: AMBER, intensity: 0.4, formAlpha: 0.35 }));
  }

  return stations;
};
