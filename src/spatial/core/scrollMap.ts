/**
 * Maps the viewport's focus line (scrollY + half the viewport) to a continuous
 * station parameter s: integer values are dwell plateaus where the camera holds
 * still, fractional values are transits between stations. Pure and stateless,
 * so the same scroll position always yields the same camera pose.
 */
export interface Span { top: number; height: number }
export interface Keyframe { y: number; s: number }

export function buildScrollMap(spans: Span[], viewportHeight: number): Keyframe[] {
  const keys: Keyframe[] = [];
  let floor = -Infinity;
  spans.forEach((span, i) => {
    const inset = Math.min(viewportHeight * 0.3, span.height * 0.3);
    let start = span.top + inset;
    let end = span.top + span.height - inset;
    if (end < start) start = end = span.top + span.height / 2;
    start = Math.max(start, floor);
    end = Math.max(end, start);
    floor = end;
    keys.push({ y: start, s: i }, { y: end, s: i });
  });
  return keys;
}

const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export function mapScroll(keys: Keyframe[], focusY: number): number {
  if (keys.length === 0) return 0;
  if (focusY <= keys[0].y) return keys[0].s;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (focusY <= b.y) {
      if (a.s === b.s || b.y === a.y) return a.s;
      const t = (focusY - a.y) / (b.y - a.y);
      return a.s + (b.s - a.s) * smootherstep(t);
    }
  }
  return keys[keys.length - 1].s;
}
