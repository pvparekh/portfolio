// Captures the spatial journey at every reading position and mid-travel.
// Usage: node scripts/journey-shots.mjs [baseUrl] [outDir] [width] [height] [path]
// SPATIAL_MOBILE=1 emulates a phone; SPATIAL_GPU=swiftshader forces software GL.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const out = process.argv[3] ?? 'qa-spatial/journey';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const path = process.argv[6] ?? '/';
const mobile = process.env.SPATIAL_MOBILE === '1';
const gpu = process.env.SPATIAL_GPU === 'swiftshader'
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: gpu });
const page = await browser.newPage(mobile
  ? { viewport: { width, height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { viewport: { width, height } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
await page.goto(base + path + (path.includes('?') ? '&' : '?') + 'layout=spatial', { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 20000 }).catch(() => errors.push('WebGL never became ready'));
await page.waitForTimeout(2500);
const stops = await page.evaluate(() => {
  const tl = window.__journey.timeline();
  return tl.segments.map(s => ({ kind: s.kind, start: s.start, end: s.end, destination: s.destination, shot: s.shot }));
});
const tag = path === '/' ? 'home' : path.replace(/\W+/g, '');
let i = 0;
for (const s of stops) {
  const y = s.kind === 'dwell' ? s.start + 2 : s.start + (s.end - s.start) * 0.5;
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
  await page.waitForTimeout(s.kind === 'dwell' ? 1300 : 900);
  const file = `${out}/${tag}-${String(i++).padStart(2, '0')}-${s.kind}-d${s.destination}s${s.shot}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 72 });
  console.log(file);
}
console.log('GL', JSON.stringify(await page.evaluate(() => window.__journey.gl?.())));
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'No page errors');
await browser.close();
