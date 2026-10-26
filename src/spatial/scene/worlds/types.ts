import type { Anchor } from '../../core/anchors';

export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

/** Must match the FORM_* constants in filament.vert.glsl. */
export const Form = {
  free: 0,
  ring: 1,
  gates: 2,
  lanes: 3,
  ribbon: 4,
  twoPass: 5,
  knots: 6,
  modules: 7,
  converge: 8,
  confluence: 9,
  planes: 10,
} as const;

export interface Formation {
  kind: number;
  center: Vec3;
  a: Vec4;
  b: Vec4;
  c: Vec4;
  /** Share of the filament pool that joins the structure (0..1). */
  share: number;
  /** Stations whose formations share a key stay locked through the transit. */
  key: string;
  /** Anchor ids whose hover/focus highlights a sub-structure, by index. */
  highlight?: string[];
  /** Anchor id prefix; the count of these anchors above the reading line fills formation.b[0]. */
  progressPrefix?: string;
}

export interface Station {
  anchor: string;
  position: Vec3;
  target: Vec3;
  fov: number;
  formation: Formation;
  /** Share of free filaments shown (0..1). */
  density: number;
  /** Multiplier of the base flow speed. */
  speed: number;
  /** Reading scrim strength under the content column (0..1). */
  scrim: number;
  /** Horizon haze strength. */
  haze: number;
  /** Brightness of free filaments (0..1). */
  intensity: number;
  /** Brightness of the formation structure (0..1). */
  formAlpha: number;
  tint: string;
  tintMix: number;
  /** Overrides applied on portrait screens (aspect < 0.8). */
  portrait?: Partial<Omit<Station, 'portrait' | 'anchor' | 'formation'>> & { formation?: Formation };
}

export type WorldBuilder = (anchors: Anchor[]) => Station[];

export const free: Formation = { kind: Form.free, center: [0, 0, 0], a: [0, 0, 0, 0], b: [0, 0, 0, 0], c: [0, 0, 0, 0], share: 0, key: 'free' };

export const AMBER = '#F59E0B';

export function formation(kind: number, key: string, center: Vec3, a: Vec4, b: Vec4 = [0, 0, 0, 0], c: Vec4 = [0, 0, 0, 0], extra: Partial<Formation> = {}): Formation {
  return { kind, key, center, a, b, c, share: 0.35, ...extra };
}

export function station(anchor: string, position: Vec3, target: Vec3, form: Formation, extra: Partial<Station> = {}): Station {
  return {
    anchor, position, target, formation: form,
    fov: 32, density: 0.55, speed: 0.7, scrim: 0.8, haze: 1, tint: AMBER, tintMix: 0, intensity: 0.5, formAlpha: 0.55,
    ...extra,
  };
}

/** Bitmask of anchors (in order) whose meta field matches, for dashed/dotted module outlines. */
export function maskWhere(anchors: Anchor[], test: (anchor: Anchor) => boolean) {
  return anchors.reduce((mask, anchor, i) => (test(anchor) ? mask | (1 << i) : mask), 0);
}
