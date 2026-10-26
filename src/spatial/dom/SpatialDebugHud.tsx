import { useEffect, useState } from 'react';
import { spatialStore } from '../core/store';

type Debug = {
  director?: () => { station: string; s: number };
  info?: () => { quality: number; dpr: number; count: number; calls: number };
  frameStats?: () => { samples: number; p50: number; p95: number; p99: number };
};

/**
 * On-device readout for measuring real phones and laptops: open any page with
 * ?spatial-debug and read tier, quality level, DPR and rolling frame times.
 */
export default function SpatialDebugHud() {
  const [text, setText] = useState('spatial: waiting');
  useEffect(() => {
    const id = window.setInterval(() => {
      const debug = (window as Window & { __spatial?: Debug }).__spatial;
      const state = spatialStore.getState();
      const info = debug?.info?.();
      const frames = debug?.frameStats?.();
      const where = debug?.director?.();
      setText([
        `tier ${state.tier} · ${state.motion}${state.ready ? '' : ' · loading'}`,
        info ? `q${info.quality} · dpr ${info.dpr.toFixed(2)} · ${info.count} filaments` : '',
        frames && frames.samples ? `frame p50 ${frames.p50.toFixed(1)} · p95 ${frames.p95.toFixed(1)} · p99 ${frames.p99.toFixed(1)} ms (${frames.samples})` : '',
        where ? `${where.station} · s ${where.s.toFixed(2)}` : '',
        `${window.innerWidth}×${window.innerHeight} · dpr ${window.devicePixelRatio}`,
      ].filter(Boolean).join('\n'));
    }, 500);
    return () => window.clearInterval(id);
  }, []);
  return <pre className="spatial-debug-hud" aria-hidden="true">{text}</pre>;
}
