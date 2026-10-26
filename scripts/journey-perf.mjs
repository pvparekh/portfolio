// Frame-time measurement for the spatial journey: a scripted scroll through every
// route, sampling requestAnimationFrame deltas. Results describe THIS machine only.
// Usage: node scripts/journey-perf.mjs [baseUrl] [outFile]
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const outFile = process.argv[3] ?? 'docs/spatial-universe/measurements/v2/frame-times.json';
const profiles = [
  { name: 'desktop-1440x900-dpr1', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'desktop-2560x1440-dpr2', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 },
  { name: 'phone-emulated-390x844-dpr3-cpu4x', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, cpuThrottle: 4 },
];

const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const renderer = await (async () => {
  const p = await browser.newPage();
  const r = await p.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  await p.close();
  return r;
})();
const results = { measuredAt: new Date().toISOString(), renderer, note: 'Headless Chromium with ANGLE D3D11 on this machine. Phone profile is CPU-throttled emulation on a desktop GPU, not a real phone.', runs: [] };

for (const profile of profiles) {
  const context = await browser.newContext(profile);
  for (const path of ['/', '/solutions', '/software']) {
    const page = await context.newPage();
    if (profile.cpuThrottle) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuThrottle });
    }
    await page.goto(base + path + '?layout=spatial', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 60000 });
    await page.waitForTimeout(2000);
    const stats = await page.evaluate(async () => {
      const deltas = [];
      let longFrames = 0;
      const observer = typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')
        ? new PerformanceObserver(list => { longFrames += list.getEntries().length; }) : null;
      observer?.observe({ type: 'long-animation-frame', buffered: false });
      let last = performance.now();
      let running = true;
      const tick = now => { deltas.push(now - last); last = now; if (running) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      const max = document.documentElement.scrollHeight - innerHeight;
      const duration = 20000;
      const start = performance.now();
      await new Promise(resolve => {
        const step = () => {
          const t = Math.min((performance.now() - start) / duration, 1);
          window.scrollTo({ top: max * t, behavior: 'instant' });
          if (t < 1) requestAnimationFrame(step); else resolve();
        };
        requestAnimationFrame(step);
      });
      running = false;
      observer?.disconnect();
      const sorted = deltas.slice(10).sort((a, b) => a - b);
      const q = p => Math.round(sorted[Math.floor(sorted.length * p)] * 10) / 10;
      return { frames: sorted.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: Math.round(sorted[sorted.length - 1] * 10) / 10, over20ms: sorted.filter(d => d > 20).length, longAnimationFrames: longFrames, gl: window.__journey.gl?.() };
    });
    results.runs.push({ profile: profile.name, path, ...stats });
    console.log(profile.name, path, JSON.stringify({ p50: stats.p50, p95: stats.p95, p99: stats.p99, max: stats.max, over20ms: stats.over20ms, laf: stats.longAnimationFrames, calls: stats.gl?.calls, dpr: stats.gl?.dpr }));
    await page.close();
  }
  await context.close();
}
await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(results, null, 2));
await browser.close();
