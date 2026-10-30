import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Keeps frames inside budget on slower GPUs or very high-DPI screens: when the
 * smoothed frame time stays over budget, render resolution steps down by 0.25
 * (never below 1); after a long stretch of headroom it steps back up toward the
 * cap. Wide hysteresis so it settles instead of flapping.
 */
export default function AdaptiveResolution({ max }: { max: number }) {
  const { setDpr, gl } = useThree();
  const state = useRef({ last: 0, ema: 16.7, over: 0, under: 0, cooldown: 0 });

  useFrame(() => {
    const now = performance.now();
    const s = state.current;
    const delta = s.last ? now - s.last : 16.7;
    s.last = now;
    if (delta > 250) return; // tab switch or pause, not a rendering cost
    s.ema = s.ema * 0.92 + delta * 0.08;
    if (s.cooldown > 0) { s.cooldown--; return; }
    const dpr = gl.getPixelRatio();
    s.over = s.ema > 19 ? s.over + 1 : 0;
    s.under = s.ema < 13.5 ? s.under + 1 : 0;
    if (s.over > 45 && dpr > 1) {
      setDpr(Math.max(1, dpr - 0.25));
      s.over = 0;
      s.cooldown = 90;
    } else if (s.under > 600 && dpr < max) {
      setDpr(Math.min(max, dpr + 0.25));
      s.under = 0;
      s.cooldown = 180;
    }
  });

  return null;
}
