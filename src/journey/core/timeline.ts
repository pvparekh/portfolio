import { add, basis, catmullRom, clamp, easeInOutCubic, easeInOutSine, lerp3, scale, smoothstep, sub, type Vec3 } from './math';
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
  travel: vp.height * 1.5,
  move: vp.height * 0.75,
  dwell: vp.height * 0.6,
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
  let previous: { pose: Pose; normal: Vec3 } | null = null;

  destinations.forEach((dest, di) => {
    dest.shots.forEach((shot, si) => {
      const panel = panels.get(shot.panel);
      if (!panel) return;
      const poses = shotPoses(panel, heights.get(panel.id) ?? vp.height * 0.6, vp, shot.offsetX, shot.offsetY);
      if (previous) {
        const isTravel = si === 0;
        const length = isTravel ? lengths.travel : lengths.move;
        const path = isTravel
          ? travelPath(previous.pose, previous.normal, dest.approach, poses.start, vp)
          : movePath(previous.pose, poses.start, previous.normal, poses.normal, vp);
        segments.push({ kind: isTravel ? 'travel' : 'move', start: cursor, end: cursor + length, destination: di, shot: si, from: previous.pose, to: poses.start, path });
        cursor += length;
      }
      if (si === 0) destinationStarts.push(cursor);
      dwellStarts.set(`${di}:${si}`, cursor);
      const dwell = lengths.dwell + poses.pan + (shot.dwell ?? 0) * vp.height;
      segments.push({ kind: 'dwell', start: cursor, end: cursor + dwell, destination: di, shot: si, from: poses.start, to: poses.end });
      cursor += dwell;
      previous = { pose: poses.end, normal: poses.normal };
    });
  });

  return { segments, total: cursor, destinationStarts, dwellStarts };
}

/** Pull back off the panel, rise, pass the destination's establishing viewpoint, then settle. */
function travelPath(from: Pose, fromNormal: Vec3, approach: Vec3, to: Pose, vp: Viewport): Vec3[] {
  const depart = add(add(from.position, scale(fromNormal, vp.perspective * 1.4)), [0, vp.perspective * 0.35, 0]);
  return [from.position, depart, approach, to.position];
}

/** A gentle lateral arc between two shots in the same destination. */
function movePath(from: Pose, to: Pose, n0: Vec3, n1: Vec3, vp: Viewport): Vec3[] {
  const mid = lerp3(from.position, to.position, 0.5);
  const back = scale(add(n0, n1), vp.perspective * 0.22);
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
      pose: { position: lerp3(segment.from.position, segment.to.position, raw), target: lerp3(segment.from.target, segment.to.target, raw) },
      segment, t: raw, travel: 0,
    };
  }
  const travel = segment.kind === 'travel';
  const t = travel ? easeInOutCubic(raw) : easeInOutSine(raw);
  const path = segment.path ?? [segment.from.position, segment.to.position];
  const position = catmullRom(path, t);
  // Look target: start at the departing shot's target, lead along the path mid-journey, end on the arriving shot's target.
  const settled = lerp3(segment.from.target, segment.to.target, smoothstep(0.15, 0.85, t));
  let target = settled;
  if (travel) {
    const ahead = catmullRom(path, Math.min(1, t + 0.06));
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
