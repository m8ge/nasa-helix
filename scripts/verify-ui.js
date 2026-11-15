import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const url = process.argv[2] || 'http://localhost:3000/';
  const outPath = process.argv[3] || 'screenshot.png';

  console.log(`[QA] Launching Playwright Chromium...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log(`[QA] Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  console.log(`[QA] Page title: ${await page.title()}`);

  // Create dir if needed
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`[QA] Full screenshot saved to: ${outPath}`);

  await browser.close();
}

main().catch((err) => {
  console.error('[QA Error]', err);
  process.exit(1);
});
