import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

// V2 spatial journey checks against Vite's local production preview.
// Real GPU by default (ANGLE D3D11); SPATIAL_GPU=swiftshader for CI.
// JOURNEY_PORT picks another port when 4173 is taken by another preview.
const port = process.env.JOURNEY_PORT ?? '4173';
const base = 'http://127.0.0.1:' + port;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', port, '--strictPort'], { stdio: 'pipe' });
let serverOutput = '';
server.stdout.on('data', d => { serverOutput += String(d); });
server.stderr.on('data', d => { serverOutput += String(d); });
async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw new Error('Preview exited: ' + serverOutput);
    try { const r = await fetch(base + '/'); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Preview did not start: ' + serverOutput);
}
const swift = process.env.SPATIAL_GPU === 'swiftshader';
const gpuArgs = swift
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
// Software GL fails the capability probe, so CI forces the journey explicitly.
const journeyUrl = (path, extra = '') => base + path + '?layout=spatial' + (extra ? '&' + extra : '');
const glReady = page => page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-ready'), null, { timeout: 30000 });
const frame = page => page.evaluate(() => {
  const f = window.__journey.frame();
  return f && { place: f.place, time: f.time, position: f.pose.position.map(v => Math.round(v * 100) / 100), segment: f.segment && { kind: f.segment.kind, destination: f.segment.destination, shot: f.segment.shot } };
});
const settle = (page, ms = 900) => page.waitForTimeout(ms);
const normalize = text => text.replace(/\s+/g, ' ').trim();
// Text that changes over time (typed tagline) is excluded from comparisons.
const visibleLines = page => page.evaluate(scope => {
  const root = document.querySelector(scope);
  const clone = root.cloneNode(true);
  clone.querySelectorAll('.cursor-blink, [data-journey-ui], .journey-skip, .sol-skip').forEach(el => (el.closest('.jp-origin-tagline, .font-mono.text-base') ?? el).remove());
  return clone.textContent.split(/\n+/);
}, '#root');
const links = (page, scope) => page.evaluate(sel => [...document.querySelectorAll(sel + ' a[href]')]
  .filter(a => !a.closest('[data-journey-ui]') && !a.classList.contains('journey-skip') && !a.classList.contains('sol-skip'))
  .map(a => a.getAttribute('href')), scope);

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, args: gpuArgs });
  const errors = [];

  // 1. Content completeness: everything on the standard page is in the journey, with the same links.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  for (const path of ['/', '/solutions', '/software']) {
    await page.goto(base + path + '?layout=classic', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.journey').count(), 0, path + ': classic layout');
    // Words from individual text nodes (innerText glues adjacent flex items together).
    const words = scope => page.evaluate(sel => {
      const root = document.querySelector(sel);
      const skip = el => el.closest('.cursor-blink, .jp-origin-tagline, [data-journey-ui], .journey-skip, .sol-skip, footer, .font-mono.text-base.h-8');
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const out = [];
      let group = null;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (skip(n.parentElement)) continue;
        // The standard hero renders the name one letter per span; rejoin letters that share a row.
        const row = n.textContent.length === 1 ? n.parentElement.parentElement : null;
        if (row && group && group.row === row) { group.text += n.textContent; continue; }
        if (group) { out.push(group.text); group = null; }
        if (row) group = { row, text: n.textContent }; else out.push(n.textContent);
      }
      if (group) out.push(group.text);
      return out.join(' ').split(/\s+/).filter(Boolean);
    }, scope);
    const classicWords = await words('main');
    const classicLinks = new Set(await links(page, 'main'));
    await page.goto(journeyUrl(path), { waitUntil: 'networkidle' });
    await glReady(page);
    const journeyWords = new Set(await words('.journey'));
    // Inline spans (e.g. the amber PAR in the name) split words across text nodes; also accept raw text matches.
    const journeyRaw = await page.locator('.journey').evaluate(j => j.textContent);
    const missingWords = [...new Set(classicWords)].filter(w => !journeyWords.has(w) && !journeyRaw.includes(w));
    assert.deepEqual(missingWords, [], path + ': every word of the standard page appears in the journey');
    const journeyLinks = new Set(await links(page, '.journey-camera'));
    const lost = [...classicLinks].filter(h => !journeyLinks.has(h) && !h.startsWith('#'));
    assert.deepEqual(lost, [], path + ': every outbound link is preserved');
    console.log('JOURNEY_PASS content', path, classicWords.length + ' words, ' + journeyLinks.size + ' links');
  }

  // 2. Determinism: the same scroll position yields the same camera pose from either direction.
  await page.goto(journeyUrl('/', 'spatial=test'), { waitUntil: 'networkidle' });
  await glReady(page);
  const target = await page.evaluate(() => window.__journey.timeline().destinationStarts[3] + 200);
  const poseAt = async from => {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), from);
    await settle(page, 300);
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), target);
    await settle(page, 500);
    return frame(page);
  };
  const a = await poseAt(0);
  const b = await poseAt(await page.evaluate(() => document.documentElement.scrollHeight));
  assert.deepEqual(a.position, b.position, 'pose is a pure function of scroll');
  assert.equal(a.segment.destination, 3, 'deep journey position is the Projects destination');
  console.log('JOURNEY_PASS determinism', a.position.join(','));

  // 3. Reading state: at a dwell the camera holds still while the reader scrolls within it.
  const dwell = await page.evaluate(() => window.__journey.timeline().segments.find(s => s.kind === 'dwell' && s.destination === 1));
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), dwell.start + 5);
  await settle(page, 400);
  const d1 = await frame(page);
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), dwell.start + Math.min(80, (dwell.end - dwell.start) / 2));
  await settle(page, 400);
  const d2 = await frame(page);
  assert.deepEqual(d1.position, d2.position, 'camera holds still while reading a panel that fits');
  console.log('JOURNEY_PASS reading dwell');

  // 4. Pause control freezes ambient motion and persists.
  await page.goto(journeyUrl('/'), { waitUntil: 'networkidle' });
  await glReady(page);
  await settle(page);
  await page.locator('.spatial-motion-toggle').click();
  const t1 = (await frame(page)).time;
  await settle(page, 600);
  assert.equal((await frame(page)).time, t1, 'paused scene time stays fixed');
  await page.reload({ waitUntil: 'networkidle' });
  await glReady(page);
  assert.equal(await page.locator('.spatial-motion-toggle').getAttribute('aria-label'), 'Play background motion', 'pause persists');
  await page.locator('.spatial-motion-toggle').click();
  console.log('JOURNEY_PASS pause control');

  // 5. Deep links land on their destination.
  await page.goto(journeyUrl('/') + '#projects', { waitUntil: 'networkidle' });
  await glReady(page);
  await settle(page, 1200);
  assert.equal((await frame(page)).segment.destination, 3, '#projects deep link arrives at Projects');
  console.log('JOURNEY_PASS deep link');

  // 6. Keyboard: focusing a link in a far panel travels to it.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await settle(page, 600);
  await page.locator('.journey-panel[data-panel="contact"] a').first().focus();
  await settle(page, 1200);
  assert.equal((await frame(page)).segment.destination, 5, 'focus inside the contact panel travels to Contact');
  console.log('JOURNEY_PASS keyboard focus travel');

  // 7. Routes: each page mounts its own world; one canvas at a time; back works.
  await page.goto(journeyUrl('/'), { waitUntil: 'networkidle' });
  await glReady(page);
  await page.locator('.portfolio-desktop-nav a[href="/solutions"]').click();
  await page.waitForFunction(() => document.querySelector('.journey--solutions'));
  await glReady(page);
  assert.equal(await page.locator('canvas').count(), 1, 'single canvas after navigation');
  await page.goBack();
  await page.waitForFunction(() => document.querySelector('.journey--portfolio'));
  await glReady(page);
  assert.equal(await page.locator('canvas').count(), 1, 'single canvas after back navigation');
  console.log('JOURNEY_PASS routes');

  // 7b. Exhibits respond to the pointer: hover lifts (cursor changes), click inspects, Escape closes.
  await page.goto(journeyUrl('/'), { waitUntil: 'networkidle' });
  await glReady(page);
  await page.evaluate(() => window.scrollTo({ top: window.__journey.engine.panelOffset('fv-info') + 2, behavior: 'instant' }));
  await settle(page, 2500);
  let hoverAt = null;
  for (let x = 1400; x >= 760 && !hoverAt; x -= 40) {
    for (let y = 220; y <= 760 && !hoverAt; y += 40) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(40);
      if (await page.evaluate(() => document.documentElement.classList.contains('journey-pick'))) hoverAt = [x, y];
    }
  }
  assert.ok(hoverAt, 'pointer finds a Formula Vision screen');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'qa-spatial/exhibit-hover.jpg', type: 'jpeg', quality: 75 }).catch(() => {});
  await page.mouse.click(hoverAt[0], hoverAt[1]);
  await page.waitForSelector('.journey-inspect img');
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('journey-inspect-close')), true, 'inspect view takes focus');
  const firstSrc = await page.locator('.journey-inspect img').getAttribute('src');
  await page.keyboard.press('ArrowRight');
  assert.notEqual(await page.locator('.journey-inspect img').getAttribute('src'), firstSrc, 'arrow keys step through the screenshots');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.journey-inspect').count(), 0, 'Escape closes the inspect view');
  console.log('JOURNEY_PASS exhibit hover and inspect', JSON.stringify(hoverAt));

  // 8. WebGL context loss keeps content usable and recovers.
  await glReady(page);
  await page.evaluate(() => window.__journey.loseContext());
  await page.waitForFunction(() => document.documentElement.classList.contains('journey-gl-lost'));
  assert.ok(await page.locator('.journey-panel').first().isVisible(), 'panels remain while WebGL is lost');
  await page.evaluate(() => window.__journey.restoreContext());
  await page.waitForFunction(() => !document.documentElement.classList.contains('journey-gl-lost'));
  console.log('JOURNEY_PASS context loss');
  await context.close();

  // 9. Reduced motion and explicit opt-out get the standard page.
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await reduced.newPage();
  await rp.goto(base + '/', { waitUntil: 'networkidle' });
  assert.equal(await rp.locator('.journey').count(), 0, 'reduced motion gets the standard page');
  assert.ok(await rp.locator('main #about').count(), 'standard page content present');
  await reduced.close();
  console.log('JOURNEY_PASS reduced motion');

  // 10a. Phones and tablets get the standard site by default (desktop-only journey for now).
  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const touch = await touchContext.newPage();
  await touch.goto(base + '/', { waitUntil: 'networkidle' });
  assert.equal(await touch.locator('.journey').count(), 0, 'phones get the standard page by default');
  assert.ok(await touch.locator('main #about').count(), 'standard page content present on phones');
  await touchContext.close();
  console.log('JOURNEY_PASS phones default to standard layout');

  // 10b. Desktop default (no override) gets the journey, with no visible layout switch.
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desk.newPage();
  await dp.goto(base + '/', { waitUntil: 'networkidle' });
  if (!swift) {
    assert.ok(await dp.locator('.journey').count(), 'desktop gets the journey by default');
    assert.equal(await dp.locator('.journey-layout-switch').count(), 0, 'no visible layout switch');
    console.log('JOURNEY_PASS desktop default journey, switch hidden');
  }
  await desk.close();

  // 10. Phones (forced with ?layout=spatial): journey with capped DPR and readable 1:1 panels.
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const phone = await phoneContext.newPage();
  phone.on('pageerror', e => errors.push('phone: ' + e.message));
  await phone.goto(journeyUrl('/'), { waitUntil: 'networkidle' });
  await glReady(phone);
  const gl = await phone.evaluate(() => window.__journey.gl());
  assert.ok(gl.dpr <= 1.5, 'phone DPR capped at 1.5 (got ' + gl.dpr + ')');
  const widths = await phone.evaluate(() => [...document.querySelectorAll('.journey-panel')].map(p => p.getBoundingClientRect().width));
  assert.ok(Math.max(...widths) <= 390, 'panels fit the phone width');
  console.log('JOURNEY_PASS phone', JSON.stringify({ dpr: gl.dpr }));
  await phoneContext.close();

  assert.deepEqual(errors, [], 'no page errors');
  console.log('PASS: Spatial journey checks');
} finally {
  await browser?.close();
  server.kill();
}
