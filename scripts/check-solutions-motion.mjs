import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const port = 4176;
const base = 'http://127.0.0.1:' + port;
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview',
  '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
let browser;

async function ready() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base + '/')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Vite preview did not start');
}

try {
  await ready();
  await mkdir('qa-software-screenshots', { recursive: true });
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const sizes = [[320,568], [390,844], [667,375], [844,390], [768,1024], [1440,900]];

  for (const route of ['solutions','software']) {
    const expectedStyle = route === 'solutions' ? 'data-solutions' : 'software-solutions';
    const expectedHeroAnimation = route === 'solutions' ? 'data-hero-rise' : 'software-hero-slide';
    for (const [width,height] of sizes) {
      const touch = width < 1024;
      const page = await browser.newPage({
        viewport: { width, height }, hasTouch: touch, isMobile: touch,
        reducedMotion: 'no-preference'
      });
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(base + '/' + route, { waitUntil: 'domcontentloaded' });
      await page.locator('.sol-motion-enabled').waitFor({ state: 'attached' });
      assert.equal(await page.locator('.solutions.' + expectedStyle).count(), 1,
        'Correct motion variant ' + route);
      const heroAnimation = await page.locator('#sol-hero-title')
        .evaluate(node => getComputedStyle(node).animationName);
      assert.match(heroAnimation, new RegExp(expectedHeroAnimation),
        route + ' uses a distinct hero animation');
      const extraWidth = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(extraWidth <= 2, route + ' ' + width + ' horizontal overflow ' + extraWidth);

      const targets = page.locator('.sol-reveal-target');
      assert.ok(await targets.count() >= 10, 'Scroll reveals are attached across sections');
      const firstService = page.locator('.sol-service').first();
      assert.equal(await firstService.evaluate(el => el.classList.contains('sol-reveal-target')), true);
      await firstService.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await page.waitForFunction(() =>
        document.querySelector('.sol-service')?.classList.contains('sol-revealed'));
      await page.waitForFunction(() => {
        const el = document.querySelector('.sol-service');
        return !!el && Number(getComputedStyle(el).opacity) > .97;
      });

      await page.locator('.sol-case, .sol-proof-card').first()
        .evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await page.waitForFunction(() =>
        document.querySelector('.sol-case, .sol-proof-card')?.classList.contains('sol-revealed'));
      assert.deepEqual(errors, [], route + ' ' + width + ' runtime errors');
      const scrollWidth = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(scrollWidth <= 2, route + ' ' + width + ' overflow after reveals ' + scrollWidth);

      if (width === 1440 || width === 390) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(1100);
        await page.screenshot({
          path: 'qa-software-screenshots/motion-' + route + '-' + width + 'x' + height + '-hero.png'
        });
      }
      await page.close();
      console.log('MOTION_PASS', route, width + 'x' + height);
    }

    const reduced = await browser.newPage({
      viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
      reducedMotion: 'reduce'
    });
    await reduced.goto(base + '/' + route, { waitUntil: 'domcontentloaded' });
    assert.equal(await reduced.locator('.sol-motion-enabled').count(), 0,
      route + ' respects reduced-motion visibility');
    assert.equal(await reduced.locator('.sol-reveal-target').count(), 0,
      route + ' does not hide scroll content for reduced-motion');
    const reducedHero = await reduced.locator('#sol-hero-title')
      .evaluate(el => getComputedStyle(el).animationName);
    assert.equal(reducedHero, 'none', route + ' has no heading animation under reduced motion');
    assert.equal(await reduced.locator('main section').count() >= 5, true,
      route + ' still has all sections');
    await reduced.close();
  }

  const portfolio = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await portfolio.goto(base + '/', { waitUntil: 'domcontentloaded' });
  assert.equal(await portfolio.locator('.sol-motion-enabled').count(), 0,
    'Portfolio must have no solutions motion state');
  assert.equal(await portfolio.locator('.data-solutions, .software-solutions').count(), 0,
    'Portfolio must never receive solutions effect classes');
  await portfolio.close();
  console.log('PASS: Distinct motion, scroll reveals, reduced motion, and Portfolio isolation.');
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
}
