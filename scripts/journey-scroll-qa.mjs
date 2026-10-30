// Scroll QA for the spatial journey: drives every kind of scrolling a visitor can
// produce and fails on jitter, freezes, flicker or unpredictable motion.
// Usage: node scripts/journey-scroll-qa.mjs [baseUrl]   (needs a running preview)
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const failures = [];
const check = (ok, label, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' ' + JSON.stringify(detail) : ''}`);
  if (!ok) failures.push(label);
};

// Records one sample per animation frame until stopped.
const startRecording = page => page.evaluate(() => {
  window.__qa = { out: [], on: true };
  const f = now => {
    const fr = window.__journey.frame();
    if (fr) window.__qa.out.push({ t: now, y: scrollY, s: window.__journey.engine.smoothY, seg: fr.segment ? fr.segment.kind + ':' + fr.segment.destination + '.' + fr.segment.shot : '', time: fr.time, p: fr.pose.position.slice(), pick: document.documentElement.classList.contains('journey-pick') });
    if (window.__qa.on) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
});
const stopRecording = page => page.evaluate(() => { window.__qa.on = false; return window.__qa.out; });

/** Camera direction flips between consecutive frames while scroll input moves one way. */
function analyse(out) {
  let reversals = 0, dropped = 0, worst = 0;
  const where = [];
  for (let i = 2; i < out.length; i++) {
    const gap = out[i].t - out[i - 1].t;
    worst = Math.max(worst, gap);
    if (gap > 34) dropped++;
    const a = out[i - 1].p.map((v, k) => v - out[i - 2].p[k]);
    const b = out[i].p.map((v, k) => v - out[i - 1].p[k]);
    const la = Math.hypot(...a), lb = Math.hypot(...b);
    if (la > 2 && lb > 2 && (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (la * lb) < -0.2) { reversals++; where.push(`${out[i - 1].seg}>${out[i].seg}@${Math.round(out[i].s)}`); }
    if (gap > 34) where.push(`gap ${Math.round(gap)}ms@${out[i].seg}`);
  }
  return { frames: out.length, reversals, dropped, worstFrameMs: Math.round(worst), ...(where.length ? { where: where.slice(0, 4) } : {}) };
}

/** After input stops the camera must come to rest, monotonically, within the window. */
function settles(out, fromT) {
  const tail = out.filter(s => s.t >= fromT);
  const last = tail[tail.length - 1].p;
  const restAt = tail.findIndex((s, i) => tail.slice(i).every(x => Math.hypot(x.p[0] - last[0], x.p[1] - last[1], x.p[2] - last[2]) < 0.5));
  return restAt >= 0 ? Math.round(tail[restAt].t - fromT) : null;
}

for (const path of ['/', '/solutions', '/software']) {
  console.log(`\n== ${path}`);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + path + '?layout=spatial', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
  await page.mouse.move(1430, 880); // park the cursor off content for scroll tests

  // 1. Load and idle: no freezes, and ambient motion keeps real time.
  await startRecording(page);
  await page.waitForTimeout(6000);
  const idle = await stopRecording(page);
  const after = idle.filter(s => s.t - idle[0].t > 800);
  const idleStats = analyse(after);
  const wall = (after.at(-1).t - after[0].t) / 1000;
  const scene = after.at(-1).time - after[0].time;
  check(idleStats.worstFrameMs < 60, 'idle: no freezes after load', idleStats);
  check(scene / wall > 0.95, 'idle: background motion keeps real time', { wall: +wall.toFixed(2), scene: +scene.toFixed(2) });

  // 2. Every kind of scroll input.
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const profiles = [
    { name: 'slow wheel', run: async () => { for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(140); } } },
    { name: 'normal wheel', run: async () => { for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(45); } } },
    { name: 'fast wheel', run: async () => { for (let i = 0; i < 50; i++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(16); } } },
    { name: 'flick', run: async () => { for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 1200); await page.waitForTimeout(16); } } },
    { name: 'rapid reversals', reversing: true, run: async () => { for (let i = 0; i < 16; i++) { await page.mouse.wheel(0, i % 2 ? -500 : 600); await page.waitForTimeout(60); } } },
    { name: 'scrollbar drag', run: async () => { await page.evaluate(async m => { for (let y = 0; y <= m; y += m / 90) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); } }, max); } },
    { name: 'keyboard', reversing: 1, run: async () => { for (const k of ['PageDown', 'PageDown', 'PageDown', 'End', 'Home']) { await page.keyboard.press(k); await page.waitForTimeout(500); } } },
  ];
  // Start each run from rest: the camera must have finished any previous travel.
  const toRest = async y => {
    await page.evaluate(top => scrollTo(0, top), y);
    await page.waitForFunction(() => {
      const e = window.__journey.engine;
      return e.smoothY === scrollY && e.smoothV === 0;
    }, null, { timeout: 8000 });
    await page.waitForTimeout(300);
  };
  for (const profile of profiles) {
    await toRest(0);
    await startRecording(page);
    await profile.run();
    const inputEnd = await page.evaluate(() => performance.now());
    await page.waitForTimeout(1600);
    const out = await stopRecording(page);
    const during = analyse(out.filter(s => s.t <= inputEnd));
    const rest = settles(out, inputEnd);
    // Reversing input legitimately reverses the camera; there we only require no extra flips.
    const allowed = profile.reversing === true ? 16 : profile.reversing || 0;
    check(during.reversals <= allowed && during.dropped <= 2, `${profile.name}: smooth, no back-and-forth`, during);
    // Ambient animation (stars, the Formula Vision car) runs on the scene clock: it must
    // advance with real time on every frame, whatever the scrolling is doing.
    let clockSlips = 0;
    for (let i = 1; i < out.length; i++) {
      const wall = (out[i].t - out[i - 1].t) / 1000;
      const scene = out[i].time - out[i - 1].time;
      if (wall > 0.004 && Math.abs(scene - wall) > 0.004) clockSlips++;
    }
    check(clockSlips === 0, `${profile.name}: ambient motion keeps real time (car, stars)`, { clockSlips });
    check(rest !== null && rest < 1400, `${profile.name}: comes to rest`, { restMs: rest });
  }

  // 3. Hover never flickers: at each reading stop, a still cursor over cards and
  //    screens must leave the hover state constant.
  const dwells = await page.evaluate(() => window.__journey.timeline().segments.filter(s => s.kind === 'dwell').map(s => Math.round(s.start + 2)));
  let flicker = 0, probes = 0;
  for (const y of dwells) {
    await page.evaluate(top => scrollTo(0, top), y);
    await page.waitForTimeout(700);
    for (const [x, py] of [[360, 300], [720, 450], [1000, 420], [1180, 300], [1250, 600], [900, 700]]) {
      await page.mouse.move(x, py);
      await page.waitForTimeout(250);
      await startRecording(page);
      await page.waitForTimeout(500);
      const out = await stopRecording(page);
      probes++;
      const states = out.map(s => s.pick);
      for (let i = 1; i < states.length; i++) if (states[i] !== states[i - 1]) { flicker++; break; }
      // CSS card hover: the hovered element must stay the same with a still cursor.
      const cardFlips = await page.evaluate(async () => {
        let flips = 0, last = null;
        for (let i = 0; i < 20; i++) {
          const hovered = [...document.querySelectorAll('.journey-panel:hover')].map(e => e.dataset.panel).join();
          if (last !== null && hovered !== last) flips++;
          last = hovered;
          await new Promise(r => requestAnimationFrame(r));
        }
        return flips;
      });
      if (cardFlips) flicker++;
    }
  }
  check(flicker === 0, 'hover: no flicker with a still cursor', { probes, flicker });

  // 4. Slow scroll with the cursor over content: hover changes only as content passes under it.
  await toRest(0);
  await page.mouse.move(1150, 420);
  await page.waitForTimeout(300);
  await startRecording(page);
  for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 80); await page.waitForTimeout(50); }
  await page.waitForTimeout(800);
  const hoverRun = await stopRecording(page);
  let toggles = 0;
  for (let i = 1; i < hoverRun.length; i++) if (hoverRun[i].pick !== hoverRun[i - 1].pick) toggles++;
  const sweep = analyse(hoverRun);
  check(toggles <= 12 && sweep.reversals === 0, 'scrolling under a cursor: no hover chatter or camera jitter', { toggles, ...sweep });

  // 5. Edge cases found by independent testing (homepage).
  if (path === '/') {
    // Resize mid-journey: the camera keeps its place instead of snapping elsewhere.
    await toRest(4000);
    await startRecording(page);
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(900);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(900);
    const resized = await stopRecording(page);
    let jump = 0;
    for (let i = 1; i < resized.length; i++) jump = Math.max(jump, Math.hypot(...resized[i].p.map((v, k) => v - resized[i - 1].p[k])));
    check(jump < 600, 'resize: camera keeps its place (no snap)', { largestFrameJump: Math.round(jump) });

    // Inspect view: the page cannot scroll behind it.
    const fv = await page.evaluate(() => window.__journey.engine.panelOffset('fv-info'));
    await toRest(fv + 2);
    let spot = null;
    for (let x = 1400; x >= 760 && !spot; x -= 40) for (let y = 220; y <= 760 && !spot; y += 40) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(30);
      if (await page.evaluate(() => document.documentElement.classList.contains('journey-pick'))) spot = [x, y];
    }
    if (spot) {
      await page.mouse.click(spot[0], spot[1]);
      await page.waitForSelector('.journey-inspect');
      const before = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 400);
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(500);
      const afterY = await page.evaluate(() => scrollY);
      await page.keyboard.press('Escape');
      check(afterY === before, 'inspect: page does not scroll behind the dialog', { before, after: afterY });
    } else check(false, 'inspect: page does not scroll behind the dialog', { reason: 'no screen found' });

    // Deep link on first load lands at its destination.
    await page.goto(base + '/?layout=spatial#projects', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const deep = await page.evaluate(() => ({ y: scrollY, dest: window.__journey.frame().segment.destination }));
    check(deep.dest === 3 && deep.y > 1000, 'deep link: #projects opens at Projects', deep);

    // Back and forward restore each page's position.
    await page.goto(base + '/?layout=spatial', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
    await toRest(3000);
    await page.locator('.portfolio-desktop-nav a[href="/solutions"]').click();
    await page.waitForFunction(() => document.querySelector('.journey--solutions') && document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
    await page.waitForTimeout(800);
    await toRest(2000);
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('.journey--portfolio') && document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    const back = await page.evaluate(() => Math.round(scrollY));
    await page.goForward();
    await page.waitForFunction(() => document.querySelector('.journey--solutions') && document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    const forward = await page.evaluate(() => Math.round(scrollY));
    check(Math.abs(back - 3000) < 5 && Math.abs(forward - 2000) < 5, 'back/forward: positions restored', { back, forward });
  }

  await page.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} FAILED:\n- ${failures.join('\n- ')}` : '\nALL SCROLL QA PASSED');
process.exit(failures.length ? 1 : 0);
