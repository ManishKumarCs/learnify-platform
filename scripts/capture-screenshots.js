// Capture key page screenshots using Playwright
// Saves images under docs/screenshots
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

const PAGES = [
  { path: '/', file: 'landing.png', wait: '#__next, body' },
  { path: '/auth/login', file: 'auth-login.png', wait: 'form, body' },
  { path: '/auth/signup', file: 'auth-signup.png', wait: 'form, body' },
  { path: '/student/dashboard', file: 'student-dashboard.png', wait: 'main, body' },
  { path: '/student/exams', file: 'student-exams.png', wait: 'main, body' },
  { path: '/student/reports', file: 'reports.png', wait: 'main, body' },
  { path: '/admin/dashboard', file: 'admin-dashboard.png', wait: 'main, body' },
];

async function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
}

async function waitForServer(url, attempts = 30, delayMs = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch (e) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

(async () => {
  await ensureOutDir();
  const ok = await waitForServer(BASE_URL);
  if (!ok) {
    console.error(`Dev server not responding at ${BASE_URL}. Start it before running this script.`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  for (const item of PAGES) {
    const url = `${BASE_URL}${item.path}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      try {
        await page.waitForSelector(item.wait, { timeout: 8000 });
      } catch (_) {}
      const outPath = path.join(OUT_DIR, item.file);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved: ${outPath}`);
    } catch (err) {
      console.warn(`Failed to capture ${url}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Screenshot capture complete.');
})();
