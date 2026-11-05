import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  const prefix = process.argv[2] || 'after';
  console.log(`Starting Vite server to capture [${prefix}] screenshots...`);

  const server = await createServer({
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 5176, strictPort: false, open: false }
  });
  await server.listen();
  const port = server.httpServer.address().port;
  const baseUrl = `http://localhost:${port}/`;
  console.log(`Server running at ${baseUrl}`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 920 });

  // 1. Noticeboard (yellow banner on top, search bar below yellow banner, original card design with visible Edit button)
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_01_noticeboard.png`), fullPage: false });
  console.log(`Captured ${prefix}_01_noticeboard.png`);

  // 2. Visible Edit button on user's card
  const editBtn = await page.$('.edit-btn');
  if (editBtn) {
    await editBtn.hover();
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_02_card_visible_edit.png`), fullPage: false });
    console.log(`Captured ${prefix}_02_card_visible_edit.png`);
  }

  // 3. Search action below yellow banner
  const searchInput = await page.$('.search-box input');
  if (searchInput) {
    await searchInput.type('backpack');
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_03_search_below_banner.png`), fullPage: false });
    console.log(`Captured ${prefix}_03_search_below_banner.png`);
    // Clear search for subsequent tests
    const clearBtn = await page.$('.clear-search');
    if (clearBtn) await clearBtn.click();
  }

  // 4. Navigate to Post a Report (notice: NO search bar on this page!) and test validation errors
  const postBtn = await page.$('.report-button');
  if (postBtn) {
    await postBtn.click();
    await new Promise(r => setTimeout(r, 200));

    // Submit empty form to trigger descriptive error reasons
    const submitBtn = await page.$('.form-actions button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 300));
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_04_form_descriptive_errors.png`), fullPage: false });
    console.log(`Captured ${prefix}_04_form_descriptive_errors.png`);

    // 5. Duplicate validation error test
    const titleInput = await page.$('.form-paper input');
    const locInput = await page.$$('.form-paper input');
    const selects = await page.$$('.form-paper select');

    if (titleInput && locInput.length > 1 && selects.length >= 2) {
      await titleInput.type('Black backpack');
      await selects[0].select('lost');
      await selects[1].select('accessories');
      await locInput[1].type('Library - second floor');

      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 300));
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${prefix}_05_duplicate_error.png`), fullPage: false });
      console.log(`Captured ${prefix}_05_duplicate_error.png`);
    }
  }

  await browser.close();
  await server.close();
  console.log('All screenshots captured successfully!');
  process.exit(0);
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
