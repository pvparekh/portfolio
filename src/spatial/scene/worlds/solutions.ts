import { AMBER, Form, formation, station, type Station, type WorldBuilder } from './types';

/*
 * CONFLUENCE: Data Solutions (docs/spatial-universe/05-solutions-pages.md).
 * Disordered filaments pass a validation gate and leave as ordered lanes;
 * the camera drifts downstream (forward, slightly right, slowly descending).
 */
const CYAN = '#38BDF8';

export const buildSolutions: WorldBuilder = anchors => {
  const has = (id: string) => anchors.some(anchor => anchor.id === id);
  const ids = (prefix: string) => anchors.filter(anchor => anchor.id.startsWith(prefix)).map(anchor => anchor.id);
  const problems = ids('sol-problem:');
  const services = ids('sol-service:');
  const steps = ids('sol-step:');
  const cases = ids('sol-case:');
  const stations: Station[] = [];

  if (has('sol:hero')) {
    stations.push(station('sol:hero', [-7, 3.0, 18], [1, 2.0, -12],
      formation(Form.confluence, 'confluence', [5, 2.6, -18], [6, 4.2, 6, 0.05], [2.0, 0.08, 0.16, 0], undefined, { share: 0.42 }),
      { fov: 34, density: 0.25, speed: 0.8, scrim: 0.6, haze: 1, tint: CYAN, tintMix: 0, intensity: 0.45, formAlpha: 0.5 }));
  }
  if (has('sol:problems')) {
    stations.push(station('sol:problems', [-4, 2.8, -40], [-2, 2.2, -70],
      formation(Form.knots, 'knots', [-2, 5.2, -80], [Math.max(problems.length, 3), 2.0, 9, 0.05], [1.4, 0, 0, 0], undefined,
        { share: 0.36, highlight: problems }),
      { density: 0.2, speed: 0.6, scrim: 0.85, intensity: 0.4, formAlpha: 0.45 }));
  }
  if (has('sol:services')) {
    stations.push(station('sol:services', [0, 2.5, -110], [2, 2.0, -140],
      formation(Form.lanes, 'channels', [2, 0.12, -176], [Math.max(services.length, 4), 2.6, 60, 0.04], [0.06, 0, -1, 0], [0, 0, 0, 0],
        { share: 0.36, highlight: services }),
      { density: 0.2, speed: 0.7, scrim: 0.88, intensity: 0.4, formAlpha: 0.5 }));
  }
  if (has('sol:work')) {
    stations.push(station('sol:work', [3, 2.2, -180], [4, 2.0, -210],
      formation(Form.lanes, 'validated', [4, 0.12, -246], [6, 1.5, 60, 0.05], [0.06, 0, -1, 0], [0, 0.18, 0, 0], { share: 0.36 }),
      { density: 0.2, speed: 0.8, scrim: 0.86, tint: CYAN, tintMix: 0, intensity: 0.4, formAlpha: 0.55 }));
  }
  if (has('sol:approach')) {
    stations.push(station('sol:approach', [4, 1.9, -250], [4.5, 1.9, -280],
      formation(Form.gates, 'process-gates', [4.5, 0.05, -262], [Math.max(steps.length, 5), 22, 9, 12], [-1, 1.8, 0.06, 0.2], undefined,
        { share: 0.36, highlight: steps }),
      { density: 0.2, speed: 0.7, scrim: 0.88, intensity: 0.4, formAlpha: 0.5 }));
  }
  if (has('sol:independent')) {
    stations.push(station('sol:independent', [5, 1.7, -320], [6, 1.7, -350],
      formation(Form.lanes, 'delta', [6, 0.12, -386], [Math.max(cases.length, 2), 2.0, 60, 0.04], [0, 0, -1, 0], [2.2, 0, 0, 0],
        { share: 0.33, highlight: cases }),
      { density: 0.2, speed: 0.6, scrim: 0.86, intensity: 0.4, formAlpha: 0.55 }));
  }
  if (has('sol:contact')) {
    stations.push(station('sol:contact', [6, 1.4, -390], [6, 2.4, -800],
      formation(Form.lanes, 'open-water', [6, 0.15, -400], [3, 1.2, 60, 0.02], [0, 0, -1, 0], [0, 0, 0, 0], { share: 0.24 }),
      { fov: 30, density: 0.16, speed: 0.3, scrim: 0.82, haze: 1.6, tint: AMBER, intensity: 0.4, formAlpha: 0.45 }));
  }
  return stations;
};
