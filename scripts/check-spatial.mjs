import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

// Runs against Vite's local production preview with a real GPU (ANGLE D3D11 on Windows;
// set SPATIAL_GPU=swiftshader in CI). Verifies the spatial layer is a pure enhancement.
const base = 'http://127.0.0.1:4173';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'pipe' });
let serverOutput = '';
server.stdout.on('data', data => { serverOutput += String(data); });
server.stderr.on('data', data => { serverOutput += String(data); });
async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw new Error('Preview process exited: ' + serverOutput);
    try { const r = await fetch(base + '/'); if (r.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Preview did not start: ' + serverOutput);
}
const gpuArgs = process.env.SPATIAL_GPU === 'swiftshader'
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
// SwiftShader is a software renderer, so the tier probe would refuse it; force full tier there.
const tierParam = process.env.SPATIAL_GPU === 'swiftshader' ? 'spatial=full' : '';
const url = (path, params = '') => {
  const query = [tierParam, params].filter(Boolean).join('&');
  return base + path + (query ? '?' + query : '');
};
const ready = page => page.waitForFunction(() => document.documentElement.classList.contains('spatial-ready'), null, { timeout: 20000 });
const director = page => page.evaluate(() => window.__spatial.director());
const mainText = page => page.evaluate(() => {
  const clone = document.querySelector('main').cloneNode(true);
  // The typed tagline changes over time.
  clone.querySelectorAll('.cursor-blink').forEach(el => el.parentElement.remove());
  return clone.innerText.replace(/\s+/g, ' ').trim();
});
const links = page => page.evaluate(() => [...document.querySelectorAll('main a[href]')].map(a => a.getAttribute('href') + ' ' + a.innerText.trim()));

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, args: gpuArgs });

  // 1. Desktop: scene mounts, is decorative, and the DOM content is unchanged.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  for (const path of ['/', '/solutions', '/software']) {
    await page.goto(base + path + '?spatial=off', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('canvas').count(), 0, path + ': ?spatial=off renders no canvas');
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('spatial-ready')), false);
    const offText = await mainText(page);
    const offLinks = await links(page);
    await page.goto(url(path), { waitUntil: 'networkidle' });
    await ready(page);
    assert.equal(await page.locator('.spatial-canvas').getAttribute('aria-hidden'), 'true', path + ': canvas container aria-hidden');
    assert.equal(await page.locator('.spatial-canvas').evaluate(el => getComputedStyle(el).pointerEvents), 'none', path + ': canvas ignores pointer');
    assert.equal(await mainText(page), offText, path + ': visible text identical with and without the scene');
    assert.deepEqual(await links(page), offLinks, path + ': links identical with and without the scene');
    const state = await director(page);
    assert.ok(state.stations >= 6, path + ': world has stations (' + state.stations + ')');
    console.log('SPATIAL_PASS content', path, 'stations', state.stations);
  }

  // 2. Determinism: the same scroll position gives the same camera pose from either direction.
  await page.goto(url('/', 'spatial=test'), { waitUntil: 'networkidle' });
  await ready(page);
  const target = await page.evaluate(() => document.getElementById('experience').offsetTop + 400);
  const poseAt = async from => {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), from);
    await page.waitForTimeout(300);
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), target);
    await page.waitForTimeout(400);
    return director(page);
  };
  const fromTop = await poseAt(0);
  const fromBottom = await poseAt(await page.evaluate(() => document.documentElement.scrollHeight));
  assert.deepEqual(fromTop.camera, fromBottom.camera, 'camera pose is a pure function of scroll position');
  assert.equal(fromTop.s, fromBottom.s);
  console.log('SPATIAL_PASS determinism', fromTop.camera.join(','));

  // 3. The motion toggle pauses the scene and persists.
  await page.goto(url('/'), { waitUntil: 'networkidle' });
  await ready(page);
  const toggle = page.locator('.spatial-motion-toggle');
  assert.equal(await toggle.getAttribute('aria-label'), 'Pause background motion');
  await toggle.click();
  await page.waitForTimeout(300);
  assert.equal(await toggle.getAttribute('aria-label'), 'Play background motion');
  assert.ok(await page.evaluate(() => document.documentElement.classList.contains('spatial-still')));
  const flowA = (await director(page)).flow;
  await page.evaluate(() => window.scrollBy(0, 40));
  await page.waitForTimeout(500);
  assert.equal((await director(page)).flow, flowA, 'paused scene does not advance its flow');
  await page.reload({ waitUntil: 'networkidle' });
  await ready(page);
  assert.equal(await page.locator('.spatial-motion-toggle').getAttribute('aria-label'), 'Play background motion', 'pause persists across reload');
  await page.locator('.spatial-motion-toggle').click();
  console.log('SPATIAL_PASS motion toggle');

  // 4. Route changes keep one canvas and swap worlds.
  await page.locator('.portfolio-desktop-nav a[href="/solutions"]').click();
  await page.locator('h1').waitFor();
  await page.waitForTimeout(600);
  assert.equal(await page.locator('canvas').count(), 1, 'single persistent canvas');
  assert.match((await director(page)).station, /^sol:/, 'Data Solutions world active');
  await page.locator('.portfolio-desktop-nav a[href="/software"]').click();
  await page.waitForTimeout(600);
  assert.match((await director(page)).station, /^sw:/, 'Software Solutions world active');
  await page.goBack();
  await page.waitForTimeout(600);
  assert.match((await director(page)).station, /^sol:/, 'back navigation restores world');
  console.log('SPATIAL_PASS routes');

  // 5. Context loss falls back to the CSS site and recovers.
  await page.evaluate(() => window.__spatial.loseContext());
  await page.waitForFunction(() => !document.documentElement.classList.contains('spatial-ready'));
  await page.evaluate(() => window.__spatial.restoreContext());
  await ready(page);
  console.log('SPATIAL_PASS context loss recovery');
  assert.deepEqual(errors.filter(e => !/CONTEXT_LOST|context lost/i.test(e)), [], 'no page errors');
  await context.close();

  // 6. Reduced motion: still frames, no camera lag, no flow.
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const still = await reduced.newPage();
  await still.goto(url('/'), { waitUntil: 'networkidle' });
  await ready(still);
  assert.ok(await still.evaluate(() => document.documentElement.classList.contains('spatial-still')));
  const r1 = await director(still);
  await still.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }));
  await still.waitForTimeout(400);
  const r2 = await director(still);
  assert.equal(r2.s, r2.target, 'reduced motion: camera cuts directly to the scroll pose');
  assert.equal(r2.flow, r1.flow, 'reduced motion: filaments are frozen');
  console.log('SPATIAL_PASS reduced motion');
  await reduced.close();

  // 7. Touch devices keep the standard site until the mobile pass.
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await touch.newPage();
  await phone.goto(base + '/', { waitUntil: 'networkidle' });
  await phone.waitForTimeout(2500);
  assert.equal(await phone.locator('canvas').count(), 0, 'touch: no canvas');
  assert.ok(await phone.locator('.speed-line').first().isVisible(), 'touch: CSS speed lines remain');
  console.log('SPATIAL_PASS touch fallback');
  await touch.close();

  console.log('PASS: Spatial layer checks');
} finally {
  await browser?.close();
  server.kill();
}
