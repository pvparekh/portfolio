// Scripted scroll through every route with real GPU; reports frame-time percentiles
// and captures frames mid-transit. Usage: node scripts/spatial-sweep.mjs [baseUrl] [outDir]
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const out = process.argv[3] ?? 'qa-spatial/sweep';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = [];
for (const path of ['/', '/solutions', '/software']) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('spatial-ready'), null, { timeout: 15000 });
  await page.waitForTimeout(1200);
  const result = await page.evaluate(async () => {
    const deltas = [];
    let last = performance.now();
    let running = true;
    const tick = now => { deltas.push(now - last); last = now; if (running) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const max = document.documentElement.scrollHeight - innerHeight;
    const duration = 14000;
    const start = performance.now();
    await new Promise(resolve => {
      const step = () => {
        const t = Math.min((performance.now() - start) / duration, 1);
        window.scrollTo(0, max * t);
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
    running = false;
    const sorted = deltas.slice(10).sort((a, b) => a - b);
    const pct = q => sorted[Math.floor(sorted.length * q)];
    return { frames: sorted.length, p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), max: sorted[sorted.length - 1], info: window.__spatial?.info?.() };
  });
  report.push({ path, ...result });
  // Mid-transit frames between the first stations.
  for (const fraction of [0.12, 0.2, 0.28]) {
    await page.evaluate(f => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), fraction);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}/${path === '/' ? 'home' : path.slice(1)}-${fraction}.png` });
  }
}
console.log(JSON.stringify(report, null, 2));
await writeFile(`${out}/frame-times.json`, JSON.stringify(report, null, 2));
await browser.close();
