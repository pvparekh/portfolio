import { describe, expect, it } from 'vitest';
import { buildTimeline, sampleTimeline, shotPoses, type Viewport } from './timeline';
import type { DestinationSpec, PanelSpec } from './types';

const vp: Viewport = { width: 1440, height: 900, perspective: 900 / 2 / Math.tan((30 * Math.PI) / 360), narrow: false };

const panels: PanelSpec[] = [
  { id: 'a', destination: 'one', position: [0, 0, 0], yaw: 0, width: 600 },
  { id: 'b', destination: 'one', position: [2000, 0, -500], yaw: -20, width: 600 },
  { id: 'c', destination: 'two', position: [-30000, 4000, -60000], yaw: 30, width: 600 },
];
const destinations: DestinationSpec[] = [
  { id: 'one', label: 'One', anchor: 'one', center: [0, 0, 0], approach: [0, 0, 3000], shots: [{ panel: 'a' }, { panel: 'b' }], palette: { background: '#000', atmosphere: '#000', accent: '#fff' } },
  { id: 'two', label: 'Two', anchor: 'two', center: [-30000, 4000, -60000], approach: [-26000, 7000, -52000], shots: [{ panel: 'c' }], palette: { background: '#000', atmosphere: '#000', accent: '#fff' } },
];
const heights = new Map([['a', 500], ['b', 1800], ['c', 400]]);
const timeline = buildTimeline(destinations, new Map(panels.map(p => [p.id, p])), heights, vp);

describe('journey timeline', () => {
  it('places the camera at the exact 1:1 distance on a panel normal', () => {
    const poses = shotPoses(panels[0], 500, vp);
    expect(poses.start.position[2]).toBeCloseTo(vp.perspective, 6);
    expect(poses.pan).toBe(0);
  });

  it('pans down panels taller than the viewport and lengthens their dwell', () => {
    const poses = shotPoses(panels[1], 1800, vp);
    expect(poses.pan).toBeCloseTo(1800 - 900 * 0.8, 6);
    expect(poses.start.position[1]).toBeGreaterThan(poses.end.position[1]);
  });

  it('orders segments contiguously: dwell, move, dwell, travel, dwell', () => {
    expect(timeline.segments.map(s => s.kind)).toEqual(['dwell', 'move', 'dwell', 'travel', 'dwell']);
    for (let i = 1; i < timeline.segments.length; i++) {
      expect(timeline.segments[i].start).toBeCloseTo(timeline.segments[i - 1].end, 9);
    }
  });

  it('is continuous: no camera jumps across segment boundaries', () => {
    for (const segment of timeline.segments.slice(1)) {
      const before = sampleTimeline(timeline, segment.start - 0.01).pose;
      const after = sampleTimeline(timeline, segment.start + 0.01).pose;
      const dp = Math.hypot(...before.position.map((v, i) => v - after.position[i]) as [number, number, number]);
      const dt = Math.hypot(...before.target.map((v, i) => v - after.target[i]) as [number, number, number]);
      expect(dp).toBeLessThan(5);
      expect(dt).toBeLessThan(5);
    }
  });

  it('holds still while reading a panel that fits the viewport', () => {
    const dwell = timeline.segments[0];
    const a = sampleTimeline(timeline, dwell.start + 1).pose.position;
    const b = sampleTimeline(timeline, dwell.end - 1).pose.position;
    expect(a).toEqual(b);
  });

  it('is a pure function of scroll position (reverse equals forward)', () => {
    const ys = [10, 1300, 2600, 4100, timeline.total - 5];
    const forward = ys.map(y => sampleTimeline(timeline, y).pose);
    const backward = [...ys].reverse().map(y => sampleTimeline(timeline, y).pose).reverse();
    expect(backward).toEqual(forward);
  });

  it('records where each destination begins for markers and navigation', () => {
    expect(timeline.destinationStarts).toHaveLength(2);
    expect(timeline.destinationStarts[0]).toBe(0);
    const arrive = sampleTimeline(timeline, timeline.destinationStarts[1] + 1);
    expect(arrive.segment.kind).toBe('dwell');
    expect(arrive.segment.destination).toBe(1);
  });

  it('frames a panel and the panels stacked below it as one block', () => {
    const main: PanelSpec = { id: 'm', destination: 'one', position: [0, 0, 0], yaw: 0, width: 600 };
    const note: PanelSpec = { id: 'n', destination: 'one', position: [0, -364, 0], yaw: 0, width: 600, below: { panel: 'm', gap: 28 } };
    const dests: DestinationSpec[] = [{ ...destinations[0], shots: [{ panel: 'm', with: ['n'] }] }];
    const t = buildTimeline(dests, new Map([[main.id, main], [note.id, note]]), new Map([['m', 300], ['n', 200]]), vp);
    const dwell = t.segments.find(s => s.kind === 'dwell')!;
    const pose = sampleTimeline(t, dwell.start + 1).pose;
    // Block is 300 + 28 + 200 = 528 tall; its centre sits 114 below the main panel's centre.
    expect(pose.position[1]).toBeCloseTo(-114, 6);
  });
});
