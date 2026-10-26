import { Form, formation, maskWhere, station, type Station, type WorldBuilder } from './types';

/*
 * ASSEMBLY: Software Solutions (docs/spatial-universe/05-solutions-pages.md).
 * Filaments are edges that snap into modules and layered planes; the camera
 * trucks laterally (+X) along a workbench at constant height.
 */
const STRUCTURAL = '#E2E8F0';
const BAY = 32;

export const buildSoftware: WorldBuilder = anchors => {
  const has = (id: string) => anchors.some(anchor => anchor.id === id);
  const list = (prefix: string) => anchors.filter(anchor => anchor.id.startsWith(prefix));
  const opportunities = list('sw-opp:');
  const services = list('sw-service:');
  const cases = list('sw-case:');
  const steps = list('sw-step:');
  const classification = (anchor: { meta: Record<string, unknown> }) => String(anchor.meta.classification ?? '').toLowerCase();
  const stations: Station[] = [];
  const at = (i: number): [number, number, number] => [i * BAY, 2.2, 14];
  const look = (i: number): [number, number, number] => [i * BAY + 1.5, 2.2, -10];
  const base = { fov: 32, density: 0.2, speed: 0.7, scrim: 0.86, tint: STRUCTURAL, tintMix: 0.12, intensity: 0.4, formAlpha: 0.4 };

  if (has('sw:hero')) {
    stations.push(station('sw:hero', at(0), look(0),
      formation(Form.planes, 'layers', [6.5, 2.4, -16], [3, 9, 5.6, 2.6], [1.1, 0.7, 0.05, 1.6], undefined, { share: 0.36 }),
      { ...base, scrim: 0.5 }));
  }
  if (has('sw:opportunities')) {
    const count = Math.max(opportunities.length, 3);
    stations.push(station('sw:opportunities', at(1), look(1),
      formation(Form.modules, 'missing-slots', [BAY + 1.5, 4.2, -42], [count, count, 9, 6], [2.4, 2.4, 0.04, 1], [0, 2 ** count - 1, -1, 1.2],
        { share: 0.33, highlight: opportunities.map(anchor => anchor.id) }),
      base));
  }
  if (has('sw:services')) {
    const count = Math.max(services.length, 5);
    stations.push(station('sw:services', at(2), look(2),
      formation(Form.modules, 'bays', [2 * BAY + 1.5, 4.2, -42], [count, 3, 8.5, 5.6], [2.2, 2.2, 0.04, 0], [0, 0, -1, 1.4],
        { share: 0.36, highlight: services.map(anchor => anchor.id) }),
      base));
  }
  if (has('sw:work')) {
    const count = Math.max(cases.length, 5);
    stations.push(station('sw:work', at(3), look(3),
      formation(Form.modules, 'plinths', [3 * BAY + 1.5, 4.2, -42], [count, 3, 8.5, 5.6], [2.2, 2.2, 0.035, 0],
        [maskWhere(cases, anchor => classification(anchor).includes('independent')), maskWhere(cases, anchor => classification(anchor).includes('academic')), -1, 1.4],
        { share: 0.36, highlight: cases.map(anchor => anchor.id) }),
      base));
  }
  if (has('sw:approach')) {
    stations.push(station('sw:approach', at(4), look(4),
      formation(Form.planes, 'assembled', [4 * BAY + 7, 3.4, -36], [Math.max(steps.length, 5), 10, 5.2, 0.5], [0.15, 0.1, 0.05, 1.8], undefined,
        { share: 0.36, highlight: steps.map(anchor => anchor.id) }),
      base));
  }
  if (has('sw:contact')) {
    stations.push(station('sw:contact', at(5), look(5),
      formation(Form.modules, 'open-slot', [5 * BAY + 1.5, 3.6, -38], [2, 2, 10, 6.5], [3, 1, 0.03, 0], [0, 2, 1, 1.4], { share: 0.3 }),
      { ...base, speed: 0.35, haze: 1.5 }));
  }
  return stations;
};
