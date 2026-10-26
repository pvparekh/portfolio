import { describe, expect, it } from 'vitest';
import { buildScrollMap, mapScroll } from './scrollMap';

const viewport = 900;
const spans = [
  { top: 0, height: 900 },
  { top: 900, height: 980 },
  { top: 1880, height: 2400 },
  { top: 4280, height: 700 },
];

describe('scroll map', () => {
  const keys = buildScrollMap(spans, viewport);

  it('holds each station flat across its dwell plateau', () => {
    for (let i = 0; i < spans.length; i++) {
      const start = keys[i * 2].y;
      const end = keys[i * 2 + 1].y;
      for (let y = start; y <= end; y += (end - start) / 10 || 1) {
        expect(mapScroll(keys, y)).toBe(i);
      }
    }
  });

  it('is monotonic and continuous from top to bottom', () => {
    let previous = mapScroll(keys, -500);
    for (let y = -500; y < 6000; y += 1) {
      const s = mapScroll(keys, y);
      expect(s).toBeGreaterThanOrEqual(previous - 1e-12);
      expect(s - previous).toBeLessThan(0.01);
      previous = s;
    }
  });

  it('clamps before the first and after the last station', () => {
    expect(mapScroll(keys, -10_000)).toBe(0);
    expect(mapScroll(keys, 1e9)).toBe(spans.length - 1);
  });

  it('has no hidden state: the same input always gives the same output', () => {
    const ys = [100, 3000, 1200, 5000, 1200, 100];
    const first = ys.map(y => mapScroll(keys, y));
    const second = [...ys].reverse().map(y => mapScroll(keys, y)).reverse();
    expect(second).toEqual(first);
  });

  it('keeps plateaus ordered when spans overlap or are tiny', () => {
    const odd = buildScrollMap([{ top: 0, height: 900 }, { top: 100, height: 10 }, { top: 120, height: 2000 }], viewport);
    for (let i = 1; i < odd.length; i++) expect(odd[i].y).toBeGreaterThanOrEqual(odd[i - 1].y);
  });
});
