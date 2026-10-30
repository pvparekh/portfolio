// Scroll-feel measurement for the spatial journey, scored against explicit targets.
// Static metrics come from the timeline (pure function of scroll); dynamic metrics
// drive real wheel input and record the camera every frame.
// Usage: node scripts/journey-feel.mjs [baseUrl] [outFile]   (needs a running preview)
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const outFile = process.argv[3] ?? 'docs/spatial-universe/measurements/v2/scroll-feel.json';
const NOTCH = 100; // one mouse-wheel notch in Chromium on Windows
const VISIBLE = 24; // world units (= CSS px at the panel plane) of camera travel that reads as motion

// Targets, derived in docs/spatial-universe/13-scroll-feel-and-life.md.
const targets = {
  firstMotionPx: { max: NOTCH, why: 'The first wheel notch must visibly move the world.' },
  resumeMedianPx: { max: 0.5, unit: 'vh', why: 'Leaving a reading stop is a short deliberate push, not a wall.' },
  longestDeadNotches: { max: 4, why: 'No stretch of scroll longer than ~4 notches without visible response.' },
  vhPerDestination: { min: 1, max: 3, why: 'Scrollytelling budgets 1-2 vh per text beat, 3-5 for visual showcases.' },
  settle95Ms: { min: 200, max: 500, why: 'Smoothing comparable to Lenis lerp 0.1 (~450 ms) without feeling laggy.' },
  velocityStepRatio: { max: 0.35, why: 'Camera velocity should ramp, not jump, when a notch lands.' },
  streamSpeedCv: { max: 0.45, why: 'A steady stream of notches should produce steady motion.' },
};

const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = { measuredAt: new Date().toISOString(), viewport: '1440x900', targets, routes: [] };

for (const path of ['/', '/solutions', '/software']) {
  await page.goto(base + path + '?layout=spatial', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const stat = await page.evaluate(({ VISIBLE, NOTCH }) => {
    const j = window.__journey;
    const tl = j.timeline();
    const H = innerHeight;
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const at = y => j.sample(y).position;
    const step = 10;
    // The last stop ends the journey: holding there is arrival, not dead scroll.
    const lastDwell = tl.segments[tl.segments.length - 1];
    // Dead stretches: consecutive samples where the camera barely moves.
    let dead = 0, run = 0, longest = 0;
    let prev = at(0);
    for (let y = step; y <= lastDwell.start; y += step) {
      const p = at(y);
      if (dist(p, prev) < 0.5) { dead += step; run += step; longest = Math.max(longest, run); } else run = 0;
      prev = p;
    }
    const firstMove = from => {
      const o = at(from);
      for (let y = from; y <= tl.total; y += 2) if (dist(at(y), o) >= VISIBLE) return y - from;
      return tl.total - from;
    };
    const dwells = tl.segments.filter(s => s.kind === 'dwell');
    const resumes = dwells.slice(0, -1).map(s => firstMove(s.start));
    resumes.sort((a, b) => a - b);
    const travels = tl.segments.filter(s => s.kind === 'travel').map(s => s.end - s.start);
    return {
      totalVh: +(tl.total / H).toFixed(2),
      destinations: tl.destinationStarts.length,
      vhPerDestination: +((tl.total / H) / tl.destinationStarts.length).toFixed(2),
      firstMotionPx: firstMove(0),
      resumeMedianPx: resumes[Math.floor(resumes.length / 2)],
      resumeMedianVh: +(resumes[Math.floor(resumes.length / 2)] / H).toFixed(2),
      resumeMaxPx: resumes[resumes.length - 1],
      deadShare: +(dead / tl.total).toFixed(2),
      longestDeadPx: longest,
      longestDeadNotches: +(longest / NOTCH).toFixed(1),
      notchesPerTravel: +(travels.reduce((a, b) => a + b, 0) / travels.length / NOTCH).toFixed(1),
    };
  }, { VISIBLE, NOTCH });

  // Dynamic: a single notch in the middle of the second travel; then a steady stream.
  const travel = await page.evaluate(() => {
    const s = window.__journey.timeline().segments.filter(x => x.kind === 'travel')[1];
    return { start: Math.round(s.start), length: Math.round(s.end - s.start) };
  });
  const travelMid = Math.round(travel.start + travel.length * 0.4);
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), travelMid);
  await page.mouse.move(720, 450);
  await page.waitForTimeout(1200);
  const record = ms => page.evaluate(ms => new Promise(resolve => {
    const out = [];
    const t0 = performance.now();
    const tick = now => {
      out.push({ t: now - t0, p: window.__journey.frame().pose.position.slice() });
      if (now - t0 < ms) requestAnimationFrame(tick); else resolve(out);
    };
    requestAnimationFrame(tick);
  }), ms);
  const single = record(1200);
  await page.waitForTimeout(50);
  await page.mouse.wheel(0, NOTCH);
  const s1 = await single;
  const speeds = series => series.slice(1).map((f, i) => {
    const a = series[i];
    const dt = Math.max(f.t - a.t, 1);
    return Math.hypot(f.p[0] - a.p[0], f.p[1] - a.p[1], f.p[2] - a.p[2]) / dt;
  });
  const v = speeds(s1);
  const start = s1[0].p;
  const end = s1[s1.length - 1].p;
  const total = Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
  const moveStart = s1.find(f => Math.hypot(f.p[0] - start[0], f.p[1] - start[1], f.p[2] - start[2]) > total * 0.02);
  const at95 = s1.find(f => Math.hypot(f.p[0] - start[0], f.p[1] - start[1], f.p[2] - start[2]) >= total * 0.95);
  const peak = Math.max(...v);
  let step = 0;
  for (let i = 1; i < v.length; i++) step = Math.max(step, Math.abs(v[i] - v[i - 1]));

  // A steady stream of notches that stays inside one travel segment.
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), travel.start);
  await page.waitForTimeout(1200);
  const stream = record(1600);
  const notches = Math.max(4, Math.floor(travel.length / NOTCH) - 1);
  for (let i = 0; i < notches; i++) { await page.mouse.wheel(0, NOTCH); await page.waitForTimeout(80); }
  const s2 = await stream;
  // Steady state only: from ~250 ms in until the last notch lands (ramp-up and coast-down excluded).
  const v2 = speeds(s2).slice(15, Math.max(20, Math.round((notches * 80) / 16.7))).filter(x => x > 0);
  const mean = v2.reduce((a, b) => a + b, 0) / v2.length;
  const cv = Math.sqrt(v2.reduce((a, b) => a + (b - mean) ** 2, 0) / v2.length) / mean;

  const dyn = {
    settle95Ms: moveStart && at95 ? Math.round(at95.t - moveStart.t) : null,
    velocityStepRatio: peak ? +(step / peak).toFixed(2) : null,
    streamSpeedCv: +cv.toFixed(2),
  };
  const metrics = { ...stat, ...dyn };
  const score = {};
  for (const [k, t] of Object.entries(targets)) {
    const value = k === 'resumeMedianPx' ? metrics.resumeMedianVh : metrics[k];
    score[k] = { value, pass: value !== null && (t.min === undefined || value >= t.min) && (t.max === undefined || value <= t.max) };
  }
  report.routes.push({ path, metrics, score });
  console.log(path, JSON.stringify(metrics));
  console.log('  ', Object.entries(score).map(([k, s]) => `${s.pass ? 'PASS' : 'FAIL'} ${k}=${s.value}`).join('  '));
}

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(report, null, 2));
await browser.close();
