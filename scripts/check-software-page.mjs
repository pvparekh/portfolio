import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

// Runs against Vite's local production preview. No hosted preview or deployment.
const base = 'http://127.0.0.1:4173';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173','--strictPort'], {
  stdio: 'pipe'
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
  assert.match(await desktop.locator('h1').innerText(),/for your business/i,'Natural software headline');
  assert.equal(await desktop.locator('.sol-section-intro h2').filter({hasText:'What I can build for you'}).count(),1);
  assert.equal(await desktop.locator('.sol-section-intro h2').filter({hasText:'Software I have designed and built'}).count(),1);
  assert.equal(await desktop.locator('.portfolio-desktop-nav button[aria-label="Show Portfolio sections"]').count(),0,'Inactive Portfolio has no disclosure');
  assert.equal(await desktop.locator('.portfolio-desktop-nav button[aria-label="Show Data Solutions sections"]').count(),0,'Inactive Data Solutions has no disclosure');
  assert.equal(await desktop.locator('.software-workspace').count(),1,'Distinct software workspace illustration');
  assert.equal(await desktop.locator('.sol-flow-graphic').count(),0,'Do not reuse Data Solutions hero diagram');
  assert.equal(await desktop.locator('.software-task').count(),3,'Illustrative workspace features');
  assert.equal((await desktop.locator('main').innerText()).includes('—'),false,'No em dashes in Software Solutions');
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
  // Hover may have opened the dropdown already. Keyboard toggles must be
  // tested independently of a subsequent pointer click that would close it.
  const initialExpanded = await trigger.getAttribute('aria-expanded');
  await trigger.focus();
  await desktop.keyboard.press('Enter');
  assert.notEqual(await trigger.getAttribute('aria-expanded'),initialExpanded,
    'Keyboard activation toggles the desktop disclosure');
  if (await trigger.getAttribute('aria-expanded') !== 'true') await desktop.keyboard.press('Enter');
  assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  assert.equal(await desktop.locator('a[href="/software#work"]').count(),1);
  await desktop.keyboard.press('Escape');
  assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  await desktop.mouse.move(5,190);
  await desktop.waitForTimeout(150);
  assert.equal(await trigger.getAttribute('aria-expanded'),'false',
    'Dropdown must not reopen when the pointer has already left');
  await desktop.locator('.portfolio-desktop-nav a[href="/"]').click();
  await desktop.locator('#about').waitFor({state:'attached'});
  assert.match(await desktop.title(),/Data Engineer/);
  assert.equal(new URL(desktop.url()).pathname,'/','Portfolio destination returns to canonical root');
  assert.equal(await desktop.locator('.portfolio-desktop-nav button[aria-label="Show Data Solutions sections"]').count(),0);
  assert.equal(await desktop.locator('.portfolio-desktop-nav button[aria-label="Show Software Solutions sections"]').count(),0);
  // A mouse destination click should keep its original hitbox until pointer exit,
  // matching the existing half-second gate on Data and Software.
  await desktop.mouse.move(4,190);
  await desktop.waitForTimeout(680);
  const portfolioTrigger=desktop.locator('.portfolio-desktop-nav button[aria-label="Show Portfolio sections"]');
  assert.equal(await portfolioTrigger.count(),1,'Active Portfolio gets its disclosure after pointer exit');
  await portfolioTrigger.click();
  assert.equal(await desktop.locator('.portfolio-desktop-nav a[href="/#projects"]').count(),1);
  await desktop.locator('.portfolio-desktop-nav a[href="/#projects"]').click();
  await desktop.waitForFunction(() => window.scrollY > 250);
  await desktop.locator('.site-shared-brand').click();
  assert.equal(new URL(desktop.url()).pathname,'/');
  assert.equal(new URL(desktop.url()).hash,'','Brand removes stale Portfolio section fragments');
  await desktop.waitForFunction(() => window.scrollY <= 2);
  await desktop.reload();
  assert.equal(new URL(desktop.url()).hash,'','Portfolio refresh stays at root');
  await desktop.waitForFunction(() => window.scrollY <= 2);

  // Regression: a direct /#projects visit should never make Projects the home
  // location after clicking the brand, including on reload and browser history.
  await desktop.goto(base+'/#projects',{waitUntil:'domcontentloaded'});
  await desktop.waitForFunction(() => window.scrollY > 250);
  await desktop.locator('.site-shared-brand').click();
  assert.equal(new URL(desktop.url()).hash,'','Brand removes a directly loaded section hash');
  await desktop.waitForFunction(() => window.scrollY <= 2);
  await desktop.reload();
  await desktop.waitForFunction(() => window.scrollY <= 2);
  await desktop.locator('.portfolio-desktop-nav a[href="/solutions"]').click();
  assert.match(await desktop.locator('h1').innerText(),/manual data work/i);
  assert.equal(await desktop.locator('.portfolio-desktop-nav button[aria-label="Show Portfolio sections"]').count(),0);
  await desktop.locator('.site-shared-brand').click();
  await desktop.locator('#about').waitFor({state:'attached'});
  assert.equal(new URL(desktop.url()).pathname,'/','Brand from Data Solutions returns to root');
  await desktop.waitForFunction(() => window.scrollY <= 2);
  await desktop.goBack();
  assert.match(await desktop.locator('h1').innerText(),/manual data work/i);
  await desktop.goBack();
  await desktop.locator('#about').waitFor({state:'attached'});
  await desktop.locator('.portfolio-desktop-nav a[href="/software"]').click();
  assert.match(await desktop.locator('h1').innerText(),/Custom software/);
  await desktop.locator('.site-shared-brand').click();
  await desktop.locator('#about').waitFor({state:'attached'});
  assert.equal(new URL(desktop.url()).pathname,'/','Brand from Software Solutions returns to root');
  await desktop.waitForFunction(() => window.scrollY <= 2);
  await desktop.goBack();
  await desktop.locator('#sol-hero-title').waitFor({state:'attached'});
  assert.match(await desktop.locator('h1').innerText(),/Custom software/);

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
    const emulateTouch = width <= 1024;
    const page=await browser.newPage({
      viewport:{width,height}, reducedMotion:'reduce',
      hasTouch:emulateTouch, isMobile:emulateTouch
    });
    page.on('pageerror',e=>errors.push(`${width}x${height}: ${e.message}`));
    await page.goto(base+'/software',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>document.fonts.ready);
    const dimensions=await page.evaluate(()=>({
      documentWidth:document.documentElement.scrollWidth,
      windowWidth:document.documentElement.clientWidth,
      hero:document.querySelector('h1')?.getBoundingClientRect().width,
      workspaceRows:document.querySelectorAll('.software-task').length
    }));
    assert.ok(dimensions.documentWidth<=dimensions.windowWidth+2,`${width}x${height} overflow: ${JSON.stringify(dimensions)}`);
    assert.equal(dimensions.workspaceRows,3,`${width}x${height} application workspace rows`);
    if (width<1024) {
      const toggle=page.getByRole('button',{name:'Toggle menu'});
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true');
      const link=page.locator('#site-mobile-navigation a[href="/software"]');
      assert.equal(await link.count(),1);
      assert.equal(await page.locator('#site-mobile-navigation button[aria-label="Show Portfolio sections"]').count(),0,'Inactive Portfolio has no mobile sections');
      assert.equal(await page.locator('#site-mobile-navigation button[aria-label="Show Data Solutions sections"]').count(),0,'Inactive Data Solutions has no mobile sections');
      if(width===390){
        await page.getByRole('button',{name:'Show Software Solutions sections'}).click();
        assert.equal(await page.locator('#site-mobile-software a').count(),5);
      }
      await toggle.click();
    }
    if([320,390,768,1440].includes(width))
      await page.screenshot({path:`qa-software-screenshots/software-${width}x${height}.png`,fullPage:true});
    // Actual touch/pointer-coarse landscape emulation, not a desktop resized to landscape.
    if([667,844].includes(width) && height < width) {
      await page.screenshot({path:`qa-software-screenshots/landscape-${width}x${height}-hero.png`});
      await page.locator('#services').scrollIntoViewIfNeeded();
      await page.screenshot({path:`qa-software-screenshots/landscape-${width}x${height}-services.png`});
      await page.locator('#work').scrollIntoViewIfNeeded();
      await page.screenshot({path:`qa-software-screenshots/landscape-${width}x${height}-work.png`});
    }
    if([1024,1920].includes(width))
      await page.screenshot({path:`qa-software-screenshots/desktop-${width}x${height}-hero.png`});
    await page.close();
  }
  assert.deepEqual(errors,[], 'No browser errors at tested viewports');

  // Shared-route smoke tests on small portrait, actual touch landscape, tablet and desktop.
  // These do not alter the existing pages; they detect runtime and reflow regressions.
  for (const [width,height] of [[320,568],[667,375],[844,390],[768,1024],[1024,768],[1440,900]]) {
    for (const [route,id] of [['/','#about'],['/solutions','#sol-hero-title']]) {
      const touch=width<=1024;
      const other=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch});
      other.on('pageerror',e=>errors.push(`${route} at ${width}x${height}: ${e.message}`));
      await other.goto(base+route,{waitUntil:'domcontentloaded'});
      await other.locator(id).waitFor({state:'attached',timeout:8000});
      const sizes=await other.evaluate(()=>({
        view:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth
      }));
      assert.ok(sizes.scroll>0 && sizes.view>0,'Existing route dimensions should be measurable');
      // Overflow is compared against production main in a separate isolated A/B test.
      await other.close();
    }
  }
  assert.deepEqual(errors,[], 'No runtime errors across the existing routes');

  const portfolio=await browser.newPage();
  const portfolioErrors=[];
  portfolio.on('pageerror', e=>portfolioErrors.push(e.stack || e.message));
  portfolio.on('console', msg=>{if(msg.type()==='error') portfolioErrors.push('console: '+msg.text())});
  const portfolioResponse=await portfolio.goto(base+'/',{waitUntil:'domcontentloaded'});
  await portfolio.waitForTimeout(800);
  console.log('PORTFOLIO_DIAGNOSTIC', JSON.stringify({url:portfolio.url(),httpStatus:portfolioResponse?.status(),title:await portfolio.title(),rootHtml:(await portfolio.locator('#root').innerHTML()).slice(0,350),errors:portfolioErrors}));
  await portfolio.locator('main #about').waitFor({state:'attached',timeout:4500});
  assert.equal(await portfolio.locator('.site-shared-brand-section').count(),0);
  assert.equal(await portfolio.locator('.portfolio-desktop-nav button[aria-label="Show Portfolio sections"]').count(),1,'Direct Portfolio visit has active section disclosure');
  await portfolio.close();
  const mobilePortfolio=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await mobilePortfolio.goto(base+'/');
  await mobilePortfolio.getByRole('button',{name:'Toggle menu'}).click();
  assert.equal(await mobilePortfolio.locator('#site-mobile-navigation button[aria-label="Show Portfolio sections"]').count(),1);
  assert.equal(await mobilePortfolio.locator('#site-mobile-navigation button[aria-label="Show Data Solutions sections"]').count(),0);
  assert.equal(await mobilePortfolio.locator('#site-mobile-navigation button[aria-label="Show Software Solutions sections"]').count(),0);
  await mobilePortfolio.getByRole('button',{name:'Show Portfolio sections'}).click();
  assert.equal(await mobilePortfolio.locator('#site-mobile-portfolio a').count(),5);
  await mobilePortfolio.locator('#site-mobile-portfolio a[href="/#projects"]').click();
  await mobilePortfolio.waitForFunction(() => window.scrollY > 250);
  await mobilePortfolio.locator('.site-shared-brand').click();
  assert.equal(new URL(mobilePortfolio.url()).pathname,'/');
  assert.equal(new URL(mobilePortfolio.url()).hash,'');
  await mobilePortfolio.waitForFunction(() => window.scrollY <= 2);
  await mobilePortfolio.close();
  const data=await browser.newPage();
  await data.goto(base+'/solutions',{waitUntil:'domcontentloaded'});
  assert.match(await data.locator('h1').innerText(),/manual data work/i);
  await data.close();
  console.log('Software Solutions browser checks PASS; screenshots in qa-software-screenshots/');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  server.stdout.destroy();
  server.stderr.destroy();
}
