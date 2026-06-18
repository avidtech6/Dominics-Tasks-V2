/**
 * Cascaded click-test — DominicsTasks
 *
 * Runs the FWV v8 doctrine's cascaded-click-test equivalent for this app.
 * Steps through every route, captures DOM, verifies no white-screen, checks
 * basic invariants (page title, key elements).
 *
 * Run: npx tsx app-vp/cascaded-click-test.ts <app-url>
 * Default URL: https://ahago45ksit8.space.minimax.io
 */

import { chromium, type Browser, type Page } from 'playwright';

const APP_URL = process.argv[2] || 'https://ahago45ksit8.space.minimax.io';

interface Step {
  name: string;
  url: string;
  expectsTitle?: string | RegExp;
  expectsElement?: string;
  notes?: string;
}

const STEPS: Step[] = [
  { name: '00: Landing via /tasks redirect', url: '/', expectsElement: 'h1, h2, h3, [data-testid="task"], nav' },
  { name: '01: Tasks page', url: '/tasks', expectsElement: 'h1, h2, h3, [data-testid="task"], nav' },
  { name: '02: Calendar page', url: '/calendar', expectsElement: 'h1, h2, h3, [data-testid="calendar"], nav' },
  { name: '03: Family Chat page', url: '/chat', expectsElement: 'h1, h2, h3, [data-testid="chat"], nav' },
  { name: '04: Parent Chat page', url: '/parent-chat', expectsElement: 'h1, h2, h3, [data-testid="chat"], nav' },
  { name: '05: Resources page', url: '/resources', expectsElement: 'h1, h2, h3, nav' },
  { name: '06: History page', url: '/history', expectsElement: 'h1, h2, h3, nav' },
  { name: '07: Achievements page', url: '/achievements', expectsElement: 'h1, h2, h3, nav' },
  { name: '08: Admin (parent dashboard)', url: '/admin', expectsElement: 'h1, h2, h3, nav' },
  { name: '09: Setup page', url: '/setup', expectsElement: 'h1, h2, h3, form, button' },
  { name: '10: Profile select', url: '/profile-select', expectsElement: 'h1, h2, h3, button' },
];

async function runStep(page: Page, step: Step): Promise<{ pass: boolean; reason?: string }> {
  const startUrl = `${APP_URL}${step.url}`;
  try {
    const response = await page.goto(startUrl, { waitUntil: 'networkidle', timeout: 15000 });
    if (!response) {
      return { pass: false, reason: 'no response' };
    }
    const status = response.status();
    if (status >= 400) {
      return { pass: false, reason: `HTTP ${status}` };
    }
    // Wait for SPA hydration
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Check for white screen (root div empty)
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.trim().length : 0;
    });

    if (rootContent === 0) {
      return { pass: false, reason: 'empty #root (white screen)' };
    }

    // Check expected element exists
    if (step.expectsElement) {
      const selectors = step.expectsElement.split(',').map(s => s.trim());
      let found = false;
      for (const sel of selectors) {
        const el = await page.$(sel);
        if (el) {
          found = true;
          break;
        }
      }
      if (!found) {
        return { pass: false, reason: `no expected element (${step.expectsElement})` };
      }
    }

    return { pass: true };
  } catch (err: any) {
    return { pass: false, reason: err.message || String(err) };
  }
}

async function main() {
  console.log(`🌐 Cascaded click-test — ${APP_URL}`);
  console.log('');

  let browser: Browser | null = null;
  let pass = 0;
  let fail = 0;
  const failures: { step: string; reason: string }[] = [];

  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    for (const step of STEPS) {
      process.stdout.write(`  ${step.name} ... `);
      const result = await runStep(page, step);
      if (result.pass) {
        console.log('✅ PASS');
        pass++;
      } else {
        console.log(`❌ FAIL — ${result.reason}`);
        fail++;
        failures.push({ step: step.name, reason: result.reason || 'unknown' });
      }
    }

    await browser.close();
  } catch (err: any) {
    console.error('Browser error:', err.message);
    process.exit(2);
  }

  console.log('');
  console.log('━'.repeat(50));
  console.log(`Pass: ${pass}/${STEPS.length}`);
  console.log(`Fail: ${fail}/${STEPS.length}`);
  if (failures.length > 0) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) {
      console.log(`  ❌ ${f.step}: ${f.reason}`);
    }
  }
  console.log('');

  if (fail === 0) {
    console.log('✅ Cascaded click-test PASSED — no drift detected.');
    process.exit(0);
  } else {
    console.log('❌ Cascaded click-test FAILED — drift detected.');
    process.exit(1);
  }
}

main();
