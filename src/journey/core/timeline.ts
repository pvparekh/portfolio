import { add, basis, catmullRom, clamp, easeInOutSine, length, lerp3, normalize, scale, smoothstep, sub, type Vec3 } from './math';
import type { DestinationSpec, PanelSpec, Pose } from './types';

/**
 * The journey as a pure function of scroll position. Built from destination
 * data and measured panel heights; mapping scrollY -> camera pose has no
 * hidden state, so forward and reverse scrolling are exactly symmetric.
 */
export type SegmentKind = 'dwell' | 'move' | 'travel';

export interface Segment {
  kind: SegmentKind;
  start: number;
  end: number;
  destination: number;
  /** Shot index within the destination (dwell/move: the shot arrived at). */
  shot: number;
  from: Pose;
  to: Pose;
  /** Control points for move/travel paths (camera positions). */
  path?: Vec3[];
  /** Spline parameter at evenly spaced arc lengths (so steady scroll means steady camera speed). */
  arc?: number[];
}

export interface Timeline {
  segments: Segment[];
  total: number;
  /** Scroll offset where each destination's first dwell begins (for markers and nav). */
  destinationStarts: number[];
  /** Scroll range of every shot dwell, keyed `${destination}:${shot}`. */
  dwellStarts: Map<string, number>;
}

export interface Viewport {
  width: number;
  height: number;
  /** CSS perspective in px: distance at which world units map 1:1 to CSS px. */
  perspective: number;
  narrow: boolean;
}

export interface Lengths {
  travel: number;
  move: number;
  dwell: number;
}

export const defaultLengths = (vp: Viewport): Lengths => ({
  // Measured against scroll-feel targets (docs 13): ~1 vh per beat, short reading holds.
  travel: vp.height * 1.0,
  move: vp.height * 0.55,
  dwell: vp.height * 0.35,
});

export interface ShotPoses {
  start: Pose;
  end: Pose;
  /** Extra scroll length for panning down a panel taller than the viewport. */
  pan: number;
  normal: Vec3;
}

/** Camera poses for reading a panel at exactly 1:1 scale, panning if it is taller than the viewport. */
export function shotPoses(panel: PanelSpec, panelHeight: number, vp: Viewport, offsetX = 0, offsetY = 0): ShotPoses {
  const { right, up, normal } = basis(panel.yaw, panel.pitch ?? 0);
  const ox = vp.narrow ? 0 : offsetX * vp.width;
  const oy = vp.narrow ? 0 : offsetY * vp.height;
  // Camera sits on the panel normal at the 1:1 distance, shifted so the panel lands at the offset.
  const base = add(add(panel.position, scale(normal, vp.perspective)), add(scale(right, -ox), scale(up, oy)));
  const look = (eye: Vec3): Pose => ({ position: eye, target: sub(eye, scale(normal, vp.perspective)) });
  const usable = vp.height * 0.8;
  if (panelHeight <= usable) {
    const pose = look(base);
    return { start: pose, end: pose, pan: 0, normal };
  }
  const travel = (panelHeight - usable) / 2;
  return {
    start: look(add(base, scale(up, travel))),
    end: look(add(base, scale(up, -travel))),
    pan: panelHeight - usable,
    normal,
  };
}

/** A shot frames its panel together with any panels stacked below it, as one block. */
function composite(panel: PanelSpec, withIds: string[], panels: Map<string, PanelSpec>, heights: Map<string, number>, vp: Viewport) {
  let height = heights.get(panel.id) ?? vp.height * 0.6;
  const top = height / 2;
  for (const id of withIds) {
    const other = panels.get(id);
    if (other?.below?.panel !== panel.id) continue;
    height += (other.below.gap ?? 28) + (heights.get(id) ?? 0);
  }
  const shift = top - height / 2; // negative: centre moves down the panel's up axis
  if (shift === 0) return { spec: panel, height };
  const { up } = basis(panel.yaw, panel.pitch ?? 0);
  return { spec: { ...panel, position: add(panel.position, scale(up, shift)) }, height };
}

const ARC_SAMPLES = 96;

export function pathLength(path: Vec3[]): number {
  let total = 0;
  let prev = catmullRom(path, 0);
  for (let i = 1; i <= 64; i++) {
    const p = catmullRom(path, i / 64);
    total += Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]);
    prev = p;
  }
  return total;
}

/** Inverse arc-length table: entry i is the spline parameter at i/ARC_SAMPLES of the path's length. */
export function arcTable(path: Vec3[]): number[] {
  const fine = ARC_SAMPLES * 8;
  const lengths = [0];
  let prev = catmullRom(path, 0);
  for (let i = 1; i <= fine; i++) {
    const p = catmullRom(path, i / fine);
    lengths.push(lengths[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]));
    prev = p;
  }
  const total = lengths[fine] || 1;
  const table: number[] = [];
  let j = 0;
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const target = (i / ARC_SAMPLES) * total;
    while (j < fine && lengths[j + 1] < target) j++;
    const span = lengths[j + 1] - lengths[j] || 1;
    table.push((j + Math.min(1, Math.max(0, (target - lengths[j]) / span))) / fine);
  }
  return table;
}

function fromArc(table: number[], v: number) {
  const x = clamp(v, 0, 1) * ARC_SAMPLES;
  const i = Math.min(Math.floor(x), ARC_SAMPLES - 1);
  return table[i] + (table[i + 1] - table[i]) * (x - i);
}

export function buildTimeline(
  destinations: DestinationSpec[],
  panels: Map<string, PanelSpec>,
  heights: Map<string, number>,
  vp: Viewport,
  lengths: Lengths = defaultLengths(vp),
): Timeline {
  const segments: Segment[] = [];
  const destinationStarts: number[] = [];
  const dwellStarts = new Map<string, number>();
  let cursor = 0;
  let previous: { pose: Pose; normal: Vec3; pan: Vec3 | null } | null = null;

  destinations.forEach((dest, di) => {
    dest.shots.forEach((shot, si) => {
      const panel = panels.get(shot.panel);
      if (!panel) return;
      const { spec: framed, height: framedHeight } = composite(panel, shot.with ?? [], panels, heights, vp);
      const poses = shotPoses(framed, framedHeight, vp, shot.offsetX, shot.offsetY);
      if (previous) {
        const isTravel = si === 0;
        const path = isTravel
          ? travelPath(previous.pose, previous.normal, dest.approach, poses.start, vp, previous.pan)
          : movePath(previous.pose, poses.start, previous.normal, poses.normal, vp);
        // Scroll length grows (gently) with how far the camera actually goes, so similar
        // transitions cost similar scroll and long hops do not feel rushed.
        const distance = pathLength(path);
        const length = isTravel
          ? lengths.travel * clamp(0.8 + distance / 200000, 0.85, 1.2)
          : lengths.move * clamp(0.62 + distance / 14000, 0.7, 1.35);
        segments.push({ kind: isTravel ? 'travel' : 'move', start: cursor, end: cursor + length, destination: di, shot: si, from: previous.pose, to: poses.start, path, arc: arcTable(path) });
        cursor += length;
      }
      if (si === 0) destinationStarts.push(cursor);
      dwellStarts.set(`${di}:${si}`, cursor);
      // No hold on landing: the very first notch of scroll should already move the world.
      const hold = di === 0 && si === 0 ? 0 : lengths.dwell;
      const dwell = hold + poses.pan + (shot.dwell ?? 0) * vp.height;
      segments.push({ kind: 'dwell', start: cursor, end: cursor + dwell, destination: di, shot: si, from: poses.start, to: poses.end });
      cursor += dwell;
      const pan = sub(poses.end.position, poses.start.position);
      previous = { pose: poses.end, normal: poses.normal, pan: length(pan) > 1 ? normalize(pan) : null };
    });
  });

  return { segments, total: cursor, destinationStarts, dwellStarts };
}

/** Pull back off the panel, rise, pass the destination's establishing viewpoint, then settle. */
function travelPath(from: Pose, _fromNormal: Vec3, approach: Vec3, to: Pose, vp: Viewport, pan: Vec3 | null = null): Vec3[] {
  // Depart toward where we are going (rising slightly), never straight back off the panel:
  // the camera arrived moving into the panel, so pulling back would reverse it, which reads
  // as a bounce whenever someone scrolls through without stopping.
  const toward = sub(approach, from.position);
  const reach = Math.hypot(toward[0], toward[1], toward[2]) || 1;
  // On narrow screens tall panels are read by panning down them; rising straight after a
  // downward pan is a sharp V that a fast flick crosses in a frame or two, so there the
  // camera first carries on along the pan, then curves away. (Wide layouts are unchanged.)
  if (vp.narrow && pan) {
    const carry = add(from.position, scale(pan, vp.perspective * 0.45));
    const depart = add(carry, scale(toward, (vp.perspective * 1.4) / reach));
    return [from.position, carry, depart, approach, to.position];
  }
  const depart = add(add(from.position, scale(toward, (vp.perspective * 1.4) / reach)), [0, vp.perspective * 0.25, 0]);
  return [from.position, depart, approach, to.position];
}

/** A gentle lateral arc between two shots in the same destination. */
function movePath(from: Pose, to: Pose, n0: Vec3, n1: Vec3, vp: Viewport): Vec3[] {
  const mid = lerp3(from.position, to.position, 0.5);
  // A shallow arc only: a deep pull-back between neighbouring shots reverses the camera.
  const back = scale(add(n0, n1), vp.perspective * 0.06);
  return [from.position, add(mid, back), to.position];
}

export interface Sample {
  pose: Pose;
  segment: Segment;
  /** Local progress within the segment (eased for move/travel). */
  t: number;
  /** 0 while settled in a dwell, rising to 1 mid-travel. */
  travel: number;
}

function findSegment(timeline: Timeline, y: number): Segment {
  const { segments } = timeline;
  let lo = 0;
  let hi = segments.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (segments[mid].start <= y) lo = mid; else hi = mid - 1;
  }
  return segments[lo];
}

export function sampleTimeline(timeline: Timeline, scrollY: number): Sample {
  const y = clamp(scrollY, 0, Math.max(timeline.total - 1e-6, 0));
  const segment = findSegment(timeline, y);
  const raw = segment.end > segment.start ? (y - segment.start) / (segment.end - segment.start) : 0;
  if (segment.kind === 'dwell') {
    return {
      // Pans down tall panels ease in and out, so the camera is at rest at both ends and the
      // change of direction into the next travel never reads as a kink.
      pose: { position: lerp3(segment.from.position, segment.to.position, easeInOutSine(raw)), target: lerp3(segment.from.target, segment.to.target, easeInOutSine(raw)) },
      segment, t: raw, travel: 0,
    };
  }
  const travel = segment.kind === 'travel';
  // Part linear so motion starts the moment scrolling does; part eased so arrivals still settle.
  const t = travel ? 0.55 * raw + 0.45 * easeInOutSine(raw) : 0.6 * raw + 0.4 * easeInOutSine(raw);
  const path = segment.path ?? [segment.from.position, segment.to.position];
  const u = (v: number) => (segment.arc ? fromArc(segment.arc, v) : v);
  const position = catmullRom(path, u(t));
  // Look target: start at the departing shot's target, lead along the path mid-journey, end on the arriving shot's target.
  const settled = lerp3(segment.from.target, segment.to.target, smoothstep(0.15, 0.85, t));
  let target = settled;
  if (travel) {
    const ahead = catmullRom(path, u(Math.min(1, t + 0.06)));
    const lead = add(ahead, scale(sub(ahead, position), 6));
    const w = smoothstep(0.06, 0.3, t) * (1 - smoothstep(0.62, 0.92, t));
    target = lerp3(settled, lead, w * 0.85);
  }
  return {
    pose: { position, target },
    segment, t,
    travel: travel ? Math.sin(Math.PI * raw) : Math.sin(Math.PI * raw) * 0.35,
  };
}
