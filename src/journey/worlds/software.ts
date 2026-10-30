import type { JourneyDefinition, PanelSpec } from '../core/types';
import type { Vec3 } from '../core/math';
import { offerings } from '../../SoftwarePage';
import { softwareProjects } from '../../softwareProjects';

/*
 * Software Solutions: ASSEMBLY. A graphite workbench of modular structure;
 * software is shown being put together: exploded interface layers, modules,
 * a gallery of real applications, and finally an open slot for the next one.
 * The journey moves laterally along the bench (+X), unlike the other pages.
 */
export const S: Record<string, Vec3> = {
  hero: [0, 0, 0],
  opportunities: [26000, -600, -9000],
  services: [52000, -1200, -14000],
  work: [92000, -1400, -20000],
  approach: [132000, -1400, -16000],
  contact: [158000, -1200, -10000],
};
export const FLOOR = -2600;

const at = (base: Vec3, o: Vec3): Vec3 => [base[0] + o[0], base[1] + o[1], base[2] + o[2]];

export const swServiceIds = offerings.map((_, i) => `sw-service-${i}`);
export const swCaseIds = softwareProjects.map(p => `sw-case-${p.id}`);

/** Services step along the bench, each beside its module. */
export const SERVICE_STEP = 4600;
export const servicePosition = (i: number) => at(S.services, [(i + 1) * SERVICE_STEP, 0, -(i % 2) * 900]);
const services: PanelSpec[] = swServiceIds.map((id, i) => ({
  id, destination: 'services', position: servicePosition(i), yaw: -4, width: 960,
}));

/** Gallery: each case faces the visitor, its application on a framed screen to the right. */
export const GALLERY_STEP = 5200;
const cases: PanelSpec[] = softwareProjects.map((project, i) => ({
  id: `sw-case-${project.id}`, destination: 'work', position: at(S.work, [(i + 1) * GALLERY_STEP, 0, -(i % 2) * 700]), yaw: 4, width: 860, anchor: project.id,
}));

export const softwareJourney: JourneyDefinition = {
  panels: [
    { id: 'sw-hero', destination: 'hero', position: at(S.hero, [-430, 0, 0]), yaw: 6, width: 660 },
    { id: 'sw-preview', destination: 'hero', position: at(S.hero, [1250, 0, -1700]), yaw: -14, width: 640 },
    { id: 'sw-opportunities', destination: 'opportunities', position: S.opportunities, yaw: 0, width: 1180 },
    { id: 'sw-services-intro', destination: 'services', position: S.services, yaw: 0, width: 780 },
    { id: 'sw-tooling', destination: 'services', position: S.services, yaw: 0, width: 780, below: { panel: 'sw-services-intro' } },
    ...services,
    { id: 'sw-work-intro', destination: 'work', position: S.work, yaw: 0, width: 780 },
    ...cases,
    { id: 'sw-approach', destination: 'approach', position: S.approach, yaw: 0, width: 1180 },
    { id: 'sw-contact', destination: 'contact', position: at(S.contact, [-300, 0, 0]), yaw: 6, width: 640 },
    { id: 'sw-contact-aside', destination: 'contact', position: at(S.contact, [520, 0, -700]), yaw: -12, width: 460 },
  ],
  destinations: [
    { id: 'hero', label: 'Overview', anchor: 'sol-main', center: S.hero, approach: [0, 800, 9000],
      shots: [{ panel: 'sw-hero', offsetX: -0.18 }, { panel: 'sw-preview', offsetX: 0.16 }],
      palette: { background: '#06070A', atmosphere: '#1A2030', accent: '#93C5FD' } },
    { id: 'opportunities', label: 'Opportunity', anchor: 'opportunities', center: S.opportunities, approach: at(S.opportunities, [-9000, 3000, 14000]),
      shots: [{ panel: 'sw-opportunities' }],
      palette: { background: '#07080B', atmosphere: '#1E2433', accent: '#BFDBFE' } },
    { id: 'services', label: 'Services', anchor: 'services', center: S.services, approach: at(S.services, [-8000, 3500, 14000]),
      shots: [{ panel: 'sw-services-intro', with: ['sw-tooling'] }, ...services.map(p => ({ panel: p.id, offsetX: -0.1 }))],
      palette: { background: '#06070A', atmosphere: '#1B2232', accent: '#93C5FD' } },
    { id: 'work', label: 'Work', anchor: 'work', center: S.work, approach: at(S.work, [-9000, 3500, 15000]),
      shots: [{ panel: 'sw-work-intro', offsetX: -0.17 }, ...cases.map(p => ({ panel: p.id, offsetX: -0.15 }))],
      palette: { background: '#05060A', atmosphere: '#202638', accent: '#E2E8F0' } },
    { id: 'approach', label: 'Approach', anchor: 'approach', center: S.approach, approach: at(S.approach, [-8000, 3500, 14000]),
      shots: [{ panel: 'sw-approach' }],
      palette: { background: '#06070A', atmosphere: '#1A2030', accent: '#93C5FD' } },
    { id: 'contact', label: 'Contact', anchor: 'contact', center: S.contact, approach: at(S.contact, [-6000, 2500, 14000]),
      shots: [{ panel: 'sw-contact', offsetX: -0.16, dwell: 0.15, with: ['sw-contact-aside'] }],
      palette: { background: '#07070A', atmosphere: '#2A2214', accent: '#F59E0B' } },
  ],
};
