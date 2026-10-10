import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const versions=[
  {label:'production-main',dir:'/tmp/portfolio-production',port:4183},
  {label:'software-feature',dir:process.cwd(),port:4184}
];
const servers=[];
async function alive(url){
  for(let n=0;n<60;n++){
    try {const r=await fetch(url); if(r.ok) return} catch {}
    await new Promise(resolve=>setTimeout(resolve,150))
  }
  throw new Error('Local Vite preview failed: '+url);
}
let browser;
try{
  for(const v of versions){
    const cp=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview',
      '--host','127.0.0.1','--port',String(v.port),'--strictPort'],
      {cwd:v.dir,stdio:'ignore'});
    servers.push(cp);
    await alive('http://127.0.0.1:'+v.port+'/');
  }
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  await mkdir('qa-software-screenshots',{recursive:true});
  const configs=[
    [320,568],[360,740],[390,844],[430,932],[667,375],
    [844,390],[768,1024],[1024,768],[1440,900],[1920,1080]
  ];
  for(const route of ['/','/solutions']){
    for(const [width,height] of configs){
      const touch=width<=1024;
      const snapshots=[];
      for(const v of versions){
        const page=await browser.newPage({viewport:{width,height},isMobile:touch,hasTouch:touch,reducedMotion:'reduce'});
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const url='http://127.0.0.1:'+v.port+route;
        const response=await page.goto(url,{waitUntil:'domcontentloaded'});
        const expectSelector=route==='/'?'#about':'#sol-hero-title';
        await page.locator(expectSelector).waitFor({state:'attached',timeout:10000});
        await page.evaluate(()=>document.fonts.ready);
        await page.waitForTimeout(100);
        const snapshot=await page.evaluate(()=>({
          mainText:document.querySelector('main')?.textContent?.replace(/\s+/g,' ').trim(),
          htmlWidth:document.documentElement.scrollWidth,
          viewportWidth:document.documentElement.clientWidth,
          navHeight:document.querySelector('.site-shared-nav')?.getBoundingClientRect().height,
          sections:[...document.querySelectorAll('main section[id]')].map(el=>el.id)
        }));
        assert.equal(response.status(),200,`${v.label} ${route} ${width} HTTP`);
        assert.equal(errors.length,0,`${v.label} ${route} ${width} runtime errors: ${errors.join(' | ')}`);
        if(width===768){
          await page.screenshot({path:`qa-software-screenshots/compare-${v.label}-${route==='/'?'portfolio':'data'}-768x1024.png`});
        }
        snapshots.push(snapshot);
        await page.close();
      }
      const [baseline,feature]=snapshots;
      assert.ok(baseline.mainText && feature.mainText, `Both pages must render ${route} at ${width}`);
      assert.equal(feature.mainText,baseline.mainText,`Protected content differs at ${route} ${width}x${height}`);
      assert.deepEqual(feature.sections,baseline.sections,`Section structure differs ${route} ${width}x${height}`);
      assert.ok(Math.abs((feature.navHeight||0)-(baseline.navHeight||0))<=1,
        `Shared nav height differs at ${route} ${width}x${height}`);
      assert.ok(feature.htmlWidth <= baseline.htmlWidth + 2,
        `New overflow on protected ${route} at ${width}x${height}: baseline=${baseline.htmlWidth}, feature=${feature.htmlWidth}`);
      console.log(`PROTECTED_ROUTE_PASS ${route} ${width}x${height} widths ${baseline.htmlWidth} -> ${feature.htmlWidth}`);
    }
  }
  console.log('PASS: Existing pages have exact rendered main text/section structure and no extra overflow versus production main.');
}finally{
  await browser?.close();
  for(const p of servers)p.kill('SIGTERM');
}
