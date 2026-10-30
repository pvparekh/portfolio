import type { JourneyDefinition, PanelSpec } from '../core/types';
import type { Vec3 } from '../core/math';
import { offerings } from '../../SolutionsPage';
import { deliveryExamples } from '../../deliveryExamples';
import { caseStudies } from '../../solutionsData';

/*
 * Data Solutions: CONFLUENCE. The journey follows a river of data downstream:
 * raw tributaries converge, pass a crystalline processing lattice, and leave
 * as calm validated lanes. Each section of the page is a place on the river.
 */
export const D: Record<string, Vec3> = {
  hero: [0, 0, 0],
  problems: [12000, -1600, -24000],
  services: [-6000, -3000, -50000],
  work: [14000, -4400, -84000],
  approach: [0, -6000, -114000],
  independent: [-14000, -7000, -138000],
  contact: [0, -8000, -164000],
};

const at = (base: Vec3, o: Vec3): Vec3 => [base[0] + o[0], base[1] + o[1], base[2] + o[2]];

/** Items laid along a lane, alternating sides and angled toward its axis. */
function lane(base: Vec3, ids: string[], spacing: number, width: number, destination: string, anchors?: (string | undefined)[]): PanelSpec[] {
  return ids.map((id, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return { id, destination, position: at(base, [side * 1300, 0, -(i + 1) * spacing]), yaw: -side * 20, width, anchor: anchors?.[i] };
  });
}

export const serviceIds = offerings.map((_, i) => `sol-service-${i}`);
export const proofIds = deliveryExamples.map(item => `sol-proof-${item.id}`);
export const approvedCases = caseStudies.filter(study => study.publicationApproved);
export const caseIds = approvedCases.map(study => `sol-case-${study.id}`);

const services = lane(D.services, serviceIds, 5200, 1040, 'services');
const proofs = lane(D.work, proofIds, 5000, 1040, 'work');
const lastProof = proofIds[proofIds.length - 1];
const cases = lane(D.independent, caseIds, 5600, 1100, 'independent', approvedCases.map(s => s.id));

export const solutionsJourney: JourneyDefinition = {
  panels: [
    { id: 'sol-hero', destination: 'hero', position: at(D.hero, [-430, 0, 0]), yaw: 6, width: 660 },
    { id: 'sol-graphic', destination: 'hero', position: at(D.hero, [1250, 0, -1900]), yaw: -14, width: 640 },
    { id: 'sol-problems', destination: 'problems', position: D.problems, yaw: 0, width: 1180 },
    { id: 'sol-services-intro', destination: 'services', position: D.services, yaw: 0, width: 780 },
    { id: 'sol-tooling', destination: 'services', position: D.services, yaw: 0, width: 780, below: { panel: 'sol-services-intro' } },
    ...services,
    { id: 'sol-work-intro', destination: 'work', position: D.work, yaw: 0, width: 780 },
    ...proofs,
    { id: 'sol-proof-close', destination: 'work', position: D.work, yaw: 0, width: 1040, below: { panel: lastProof } },
    { id: 'sol-approach', destination: 'approach', position: D.approach, yaw: 0, width: 1180 },
    { id: 'sol-independent-intro', destination: 'independent', position: D.independent, yaw: 0, width: 780 },
    ...cases,
    { id: 'sol-contact', destination: 'contact', position: at(D.contact, [-300, 0, 0]), yaw: 6, width: 640 },
    { id: 'sol-contact-aside', destination: 'contact', position: at(D.contact, [520, 0, -700]), yaw: -12, width: 460 },
  ],
  destinations: [
    { id: 'hero', label: 'Overview', anchor: 'sol-main', center: D.hero, approach: [0, 800, 9000],
      shots: [{ panel: 'sol-hero', offsetX: -0.18 }, { panel: 'sol-graphic', offsetX: 0.16 }],
      palette: { background: '#03080A', atmosphere: '#0B2A30', accent: '#67E8F9' } },
    { id: 'problems', label: 'The problem', anchor: 'problems', center: D.problems, approach: at(D.problems, [-6000, 6000, 15000]),
      shots: [{ panel: 'sol-problems' }],
      palette: { background: '#0A0604', atmosphere: '#2A1A0C', accent: '#F5A524' } },
    { id: 'services', label: 'Services', anchor: 'services', center: D.services, approach: at(D.services, [5000, 5000, 15000]),
      shots: [{ panel: 'sol-services-intro', with: ['sol-tooling'] }, ...services.map(p => ({ panel: p.id, offsetX: p.position[0] < D.services[0] ? -0.06 : 0.06 }))],
      palette: { background: '#03090B', atmosphere: '#0D3036', accent: '#67E8F9' } },
    { id: 'work', label: 'Delivery', anchor: 'work', center: D.work, approach: at(D.work, [-5000, 5000, 15000]),
      shots: [{ panel: 'sol-work-intro' }, ...proofs.map(p => ({ panel: p.id, offsetX: p.position[0] < D.work[0] ? -0.06 : 0.06, with: p.id === lastProof ? ['sol-proof-close'] : undefined }))],
      palette: { background: '#020A0C', atmosphere: '#0A3540', accent: '#5EEAD4' } },
    { id: 'approach', label: 'Approach', anchor: 'approach', center: D.approach, approach: at(D.approach, [4000, 5000, 15000]),
      shots: [{ panel: 'sol-approach' }],
      palette: { background: '#04080C', atmosphere: '#12283A', accent: '#7DD3FC' } },
    { id: 'independent', label: 'Products', anchor: 'independent', center: D.independent, approach: at(D.independent, [5000, 5000, 15000]),
      shots: [{ panel: 'sol-independent-intro', offsetX: -0.17 }, ...cases.map(p => ({ panel: p.id, offsetX: p.position[0] < D.independent[0] ? -0.06 : 0.06 }))],
      palette: { background: '#05070C', atmosphere: '#16203A', accent: '#A5B4FC' } },
    { id: 'contact', label: 'Contact', anchor: 'contact', center: D.contact, approach: at(D.contact, [0, 3000, 15000]),
      shots: [{ panel: 'sol-contact', offsetX: -0.16, dwell: 0.15, with: ['sol-contact-aside'] }],
      palette: { background: '#03070A', atmosphere: '#0B2630', accent: '#67E8F9' } },
  ],
};
