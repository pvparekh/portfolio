import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

// Runs against Vite's local production preview. No hosted preview or deployment.
const base = 'http://127.0.0.1:4173';
const server = spawn('npm', ['run','preview','--','--host','127.0.0.1','--port','4173','--strictPort'], {
  stdio: 'pipe', shell: process.platform === 'win32'
});
let serverOutput = '';
server.stderr.on('data', data => { serverOutput += String(data); });
server.stdout.on('data', data => { serverOutput += String(data); });
async function waitForServer() {
  for (let i=0;i<50;i++) {
    if (server.exitCode !== null) throw new Error('Preview process exited: '+serverOutput);
    try { const r=await fetch(base+'/'); if(r.ok) return; } catch {}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw new Error('Preview did not start: '+serverOutput);
}
const viewports = [
  [320,568],[360,740],[390,844],[430,932],[667,375],
  [844,390],[768,1024],[1024,768],[1440,900],[1920,1080]
];
let browser;
try {
  await waitForServer();
  await mkdir('qa-software-screenshots',{recursive:true});
  browser=await chromium.launch({headless:true, args:['--no-sandbox']});
  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  desktop.on('pageerror', e=>errors.push(e.message));
  await desktop.goto(base+'/software', {waitUntil:'domcontentloaded'});
  assert.match(await desktop.locator('h1').innerText(), /Custom software/);
  assert.match(await desktop.title(), /Software Solutions/);
  assert.equal(await desktop.locator('link[rel=canonical]').getAttribute('href'),'https://parthparekh.dev/software');
  assert.equal(await desktop.locator('.sol-service').count(),5);
  assert.equal(await desktop.locator('.sol-case').count(),5);
  assert.equal(await desktop.locator('.sol-case-tag').first().innerText(),'Client website · contract work');
  assert.match(await desktop.locator('.sol-case-tag').last().innerText(),/academic/i);
  assert.equal(await desktop.locator('.sol-case-links a[href*="F1-Viewer"]').count(),0,'No private project source link');
  assert.equal(await desktop.locator('.sol-service details').count(),5);
  await desktop.locator('.sol-service details summary').first().click();
  assert.equal(await desktop.locator('.sol-service details').first().evaluate(el=>el.open),true);
  await desktop.locator('.sol-service details summary').first().click();
  assert.equal(await desktop.locator('.sol-service details').first().evaluate(el=>el.open),false);
  await desktop.locator('.portfolio-desktop-nav a[href="/solutions"]').click();
  await desktop.locator('h1').waitFor();
  assert.match(await desktop.locator('h1').innerText(),/manual data work/i);
  await desktop.locator('.portfolio-desktop-nav a[href="/software"]').click();
  assert.match(await desktop.locator('h1').innerText(),/Custom software/);
  await desktop.goBack(); assert.match(await desktop.locator('h1').innerText(),/manual data work/i);
  await desktop.goForward(); assert.match(await desktop.locator('h1').innerText(),/Custom software/);
  await desktop.reload(); assert.match(await desktop.locator('h1').innerText(),/Custom software/);
  await desktop.mouse.move(4,180);
  await desktop.waitForTimeout(650);
  const trigger=desktop.locator('button[aria-label="Show Software Solutions sections"]');
  assert.equal(await trigger.count(),1,'Active route disclosure should appear once pointer leaves');
  await trigger.click();
  assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  assert.equal(await desktop.locator('a[href="/software#work"]').count(),1);
  await trigger.focus(); await desktop.keyboard.press('Escape');
  assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  await desktop.locator('.portfolio-desktop-nav a[href="#contact"]').click();
  assert.equal(await desktop.locator('#contact').count(),1);
  const directEmail = desktop.locator('.sol-contact-email-address');
  assert.match(await directEmail.innerText(),/@/);
  const composition = await desktop.locator('.sol-contact-compose').getAttribute('href');
  assert.match(composition,/Software%20project%20inquiry/);
  await desktop.locator('.sol-contact-copy').click();
  await desktop.waitForFunction(() => /copied|unavailable/i.test(document.querySelector('.sol-contact-copy-status')?.textContent ?? ''), { timeout: 5000 });
  assert.deepEqual(errors,[], 'No client render errors');

  for (const [width,height] of viewports) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    page.on('pageerror',e=>errors.push(`${width}x${height}: ${e.message}`));
    await page.goto(base+'/software',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>document.fonts.ready);
    const dimensions=await page.evaluate(()=>({
      documentWidth:document.documentElement.scrollWidth,
      windowWidth:document.documentElement.clientWidth,
      hero:document.querySelector('h1')?.getBoundingClientRect().width,
      flowNodes:document.querySelectorAll('.sol-flow-node').length
    }));
    assert.ok(dimensions.documentWidth<=dimensions.windowWidth+2,`${width}x${height} overflow: ${JSON.stringify(dimensions)}`);
    assert.equal(dimensions.flowNodes,3,`${width}x${height} flow stages`);
    if (width<1024) {
      const toggle=page.getByRole('button',{name:'Toggle menu'});
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true');
      const link=page.locator('#site-mobile-navigation a[href="/software"]');
      assert.equal(await link.count(),1);
      if(width===390){
        await page.getByRole('button',{name:'Show Software Solutions sections'}).click();
        assert.equal(await page.locator('#site-mobile-software a').count(),5);
      }
      await toggle.click();
    }
    if([320,390,768,1440].includes(width))
      await page.screenshot({path:`qa-software-screenshots/software-${width}x${height}.png`,fullPage:true});
    await page.close();
  }
  assert.deepEqual(errors,[], 'No browser errors at tested viewports');

  const portfolio=await browser.newPage();
  await portfolio.goto(base+'/',{waitUntil:'domcontentloaded'});
  assert.ok((await portfolio.locator('h1').count())>=1);
  assert.equal(await portfolio.locator('.site-shared-brand-section').count(),0);
  await portfolio.close();
  const data=await browser.newPage();
  await data.goto(base+'/solutions',{waitUntil:'domcontentloaded'});
  assert.match(await data.locator('h1').innerText(),/manual data work/i);
  await data.close();
  console.log('Software Solutions browser checks PASS; screenshots in qa-software-screenshots/');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
