import type { Vec3 } from './math';

/** A DOM content panel placed in world space (world units are CSS pixels). */
export interface PanelSpec {
  id: string;
  destination: string;
  position: Vec3;
  /** Rotation about Y in degrees; 0 faces +Z. */
  yaw: number;
  pitch?: number;
  /** Authored CSS width in px on wide screens; narrow screens use min(width, viewport - gutter). */
  width: number;
  /** Optional id for a scroll marker at this panel's reading position (deep links such as #work). */
  anchor?: string;
  /** Stack this panel under another panel (same plane), measured at layout so it never overlaps. */
  below?: { panel: string; gap?: number };
}

/** A readable camera composition. The focus panel is shown at exactly 1:1 scale. */
export interface ShotSpec {
  panel: string;
  /** Secondary panels composed into this shot; focusing one of them travels here. */
  with?: string[];
  /** Lateral offset of the panel from screen centre, as a fraction of viewport width (wide screens only). */
  offsetX?: number;
  /** Vertical offset as a fraction of viewport height. */
  offsetY?: number;
  /** Extra dwell length, in viewport heights. */
  dwell?: number;
}

export interface Palette {
  /** Clear colour of the void at this destination. */
  background: string;
  /** Colour fog/atmosphere tends toward. */
  atmosphere: string;
  /** Accent used by panels and UI here. */
  accent: string;
}

export interface DestinationSpec {
  id: string;
  label: string;
  /** Id given to the scroll marker (deep links, nav). */
  anchor: string;
  /** World-space centre of the destination's environment. */
  center: Vec3;
  /** Establishing camera position the journey passes through on arrival. */
  approach: Vec3;
  shots: ShotSpec[];
  palette: Palette;
}

export interface Pose {
  position: Vec3;
  target: Vec3;
}

export interface JourneyDefinition {
  destinations: DestinationSpec[];
  panels: PanelSpec[];
}
