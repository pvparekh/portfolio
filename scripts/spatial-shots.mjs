// Captures the spatial scene at every station of each route (local dev or preview).
// Usage: node scripts/spatial-shots.mjs [baseUrl] [outDir] [width] [height]
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const out = process.argv[3] ?? 'qa-spatial';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const jpeg = process.argv[6] === 'jpeg';
const gpu = process.env.SPATIAL_GPU === 'swiftshader'
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];

const routes = [
  { path: '/', name: 'home' },
  { path: '/solutions', name: 'data' },
  { path: '/software', name: 'software' },
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: gpu });
const mobile = process.env.SPATIAL_MOBILE === '1';
const page = await browser.newPage(mobile
  ? { viewport: { width, height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { viewport: { width, height } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

for (const route of routes) {
  await page.goto(base + route.path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('spatial-ready'), null, { timeout: 15000 })
    .catch(() => errors.push(route.path + ': scene never became ready'));
  await page.waitForTimeout(1600);
  const renderer = await page.evaluate(() => {
    const gl = document.querySelector('canvas')?.getContext('webgl2');
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  const stops = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll('[data-scene-anchor]')]
      .map(el => ({ id: el.dataset.sceneAnchor, top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height }));
    return anchors;
  });
  console.log(route.path, 'renderer:', renderer, 'anchors:', stops.length);
  const ids = await page.evaluate(() => window.__spatial?.director?.().stations ?? 0);
  console.log('  stations:', ids);
  let index = 0;
  for (const stop of stops) {
    if (/^(fv-step|skill|sol-problem|sol-service|sol-step|sol-case|sw-opp|sw-service|sw-step|sw-case):/.test(stop.id)) continue;
    const y = Math.max(0, stop.top + Math.min(stop.height, height) / 2 - height / 2);
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(1800);
    const state = await page.evaluate(() => window.__spatial?.director?.());
    const file = `${out}/${route.name}-${String(index++).padStart(2, '0')}-${stop.id.replace(/[^a-z0-9]+/gi, '_')}.${jpeg ? 'jpg' : 'png'}`;
    await page.screenshot(jpeg ? { path: file, type: 'jpeg', quality: 70 } : { path: file });
    console.log('  ', file, state ? `s=${state.s.toFixed(2)} station=${state.station}` : '');
  }
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No page errors');
await browser.close();
