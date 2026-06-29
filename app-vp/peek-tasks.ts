import { chromium } from 'playwright';
const APP_URL = 'https://oaew5tlpgf7j.space.minimax.io';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1080 } });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CERR:', msg.text()); });
  
  await page.goto(`${APP_URL}/tasks`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(8000);  // give seed time

  const keys = await page.evaluate(() => Object.keys(localStorage));
  console.log('LS keys:', keys);
  
  const tasksRaw = await page.evaluate(() => localStorage.getItem('dominicstasks.tasks.v2'));
  const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
  console.log(`Tasks in LS: ${tasks.length}`);
  
  const taskIdEls = await page.$$eval('[data-task-id]', els => els.length);
  console.log(`Task elements in DOM: ${taskIdEls}`);
  
  const mainText = await page.evaluate(() => document.querySelector('main')?.innerText?.slice(0, 400));
  console.log('Main text:', mainText);

  await browser.close();
})();
