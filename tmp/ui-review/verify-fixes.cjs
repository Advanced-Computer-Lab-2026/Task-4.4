const assert = require('node:assert/strict');
const {chromium} = require('C:/Users/Youssef Ahmed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    // Deterministic offline font fallback, without changing the application.
    await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:5174',{waitUntil:'networkidle'});
    assert.equal(await page.locator('.owner-badge').count(),3);
    assert.equal(await page.locator('.edit-report').count(),3);
    assert.equal(await page.locator('#report-f2 button').count(),0);
    assert.equal(await page.locator('.menu').count(),0);
    const type=await page.locator('.sticky').first().evaluate(el=>({body:getComputedStyle(el.querySelector('p')).fontSize,meta:getComputedStyle(el.querySelector('.sticky-bottom')).fontSize,buttonHeight:el.querySelector('button').getBoundingClientRect().height}));
    assert.equal(type.body,'16px'); assert.equal(type.meta,'14px'); assert.ok(type.buttonHeight>=44);
    await page.screenshot({path:path.join(__dirname,'after-desktop.png')});
    const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('acl-foundboard-v3')));
    await page.getByRole('button',{name:'Post a report'}).click();
    await page.getByRole('button',{name:'Publish notice',exact:true}).click();
    assert.match(await page.locator('#report-error').innerText(),/at least 2 characters/);
    assert.equal(await page.locator('#report-error').evaluate(el=>el===document.activeElement),true);
    await page.getByLabel('Item title').fill(' black BACKPACK ');
    await page.getByLabel(/^Status/).selectOption('found');
    await page.getByLabel(/^Category/).selectOption('accessories');
    await page.getByLabel('Last known location').fill('library - second floor');
    await page.getByRole('button',{name:'Publish notice',exact:true}).click();
    assert.match(await page.locator('#report-error').innerText(),/already exists/);
    assert.match(await page.locator('#report-error').innerText(),/Edit report/);
    assert.equal(await page.locator('[aria-invalid="true"]').count(),2);
    assert.equal((await stored()).length,13);
    assert.equal(await page.getByLabel('Item title').inputValue(),' black BACKPACK ');
    await page.screenshot({path:path.join(__dirname,'after-duplicate.png')});
    await page.getByRole('button',{name:'Go back',exact:true}).click();
    // Publishing from a filtered board must still give visible feedback.
    await page.getByLabel('Search items').fill('no-match-filter');
    await page.getByRole('button',{name:'Post a report'}).click();
    await page.getByLabel('Item title').fill('Green scarf test');
    await page.getByLabel(/^Status/).selectOption('found');
    await page.getByLabel(/^Category/).selectOption('clothing');
    await page.getByLabel('Last known location').fill('Library entrance');
    await page.getByLabel('More details').fill('Green knitted scarf with a striped edge.');
    await page.getByRole('button',{name:'Publish notice',exact:true}).click();
    await page.locator('.publish-feedback').waitFor({state:'visible'});
    assert.match(await page.locator('.publish-feedback').innerText(),/Report published/);
    assert.match(await page.locator('.publish-feedback').innerText(),/Green scarf test/);
    assert.equal((await stored()).length,14);
    const toast=await page.locator('.publish-feedback').boundingBox();
    assert.ok(toast.y>=0&&toast.y+toast.height<=1000);
    await page.screenshot({path:path.join(__dirname,'after-published.png')});
    await page.getByRole('button',{name:'View report',exact:true}).click();
    assert.equal(await page.getByLabel('Search items').inputValue(),'');
    const id=(await stored())[0].id;
    assert.equal(await page.locator(`[id="report-${id}"]`).evaluate(el=>el===document.activeElement),true);
    await page.getByRole('button',{name:'Edit report: Green scarf test',exact:true}).click();
    assert.equal(await page.getByLabel('Item title').inputValue(),'Green scarf test');
    await page.getByLabel('More details').fill('Updated scarf description.');
    await page.getByRole('button',{name:'Save report',exact:true}).click();
    assert.match(await page.locator('.publish-feedback').innerText(),/Report updated/);
    assert.equal((await stored()).length,14);
    await page.reload({waitUntil:'networkidle'});
    assert.equal((await stored())[0].description,'Updated scarf description.');
    assert.match(await page.locator(`[id="report-${id}"]`).innerText(),/Your report/);
    // Same-title edits must remain valid and preserve receipt information.
    await page.getByRole('button',{name:'Edit report: Calculator',exact:true}).click();
    await page.getByRole('button',{name:'Save report',exact:true}).click();
    const calculator=(await stored()).find(x=>x.id==='f11');
    assert.equal(calculator.collectionPoint,'Library Reception');
    assert.equal(calculator.handoverStatus,'received');
    assert.equal((await stored()).length,14);
    for(const width of [375,800,1440]){
      await page.setViewportSize({width,height:900});
      await page.getByRole('button',{name:'Dismiss',exact:true}).click().catch(()=>{});
      await page.getByRole('button',{name:'Noticeboard',exact:true}).click();
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      assert.equal(overflow,false,`Horizontal overflow at ${width}px`);
      if(width===375){
        await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:path.join(__dirname,'after-mobile.png')});
        await page.getByRole('button',{name:'Post a report'}).click();
        await page.getByRole('button',{name:'Publish notice',exact:true}).click();
        assert.ok((await page.locator('#report-error').boundingBox()).y>=0);
        await page.getByLabel('Item title').fill('Mobile notice test');
        await page.getByLabel(/^Status/).selectOption('lost');
        await page.getByLabel(/^Category/).selectOption('other');
        await page.getByRole('button',{name:'Publish notice',exact:true}).click();
        const mobileToast=await page.locator('.publish-feedback').boundingBox();
        assert.ok(mobileToast.x>=0&&mobileToast.x+mobileToast.width<=375);
        assert.ok(mobileToast.y>=0&&mobileToast.y+mobileToast.height<=900);
        await page.screenshot({path:path.join(__dirname,'after-mobile-published.png')});
        await page.getByRole('button',{name:'View report',exact:true}).click();
        assert.match(await page.evaluate(()=>document.activeElement.textContent),/Mobile notice test/);
      }
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: publish confirmation and View report (desktop/mobile), specific duplicate and required-field feedback, owned-only editing, unchanged-title edits, receipt metadata, reload persistence, typography/control sizes, and no horizontal overflow at 375/800/1440px. No browser runtime errors.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

