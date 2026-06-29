/**
 * Click-every-clickable audit.
 *
 * Loads the deployed app, walks every route, attempts to click every
 * clickable element, captures the result. Reports what's broken, what's
 * stubbed, and what works.
 *
 * Run: npx tsx app-vp/audit-click-everything.ts https://n7c4shn8ct4x.space.minimax.io
 */

import { chromium, type Page, type Browser } from 'playwright';

const APP_URL = process.argv[2] || 'https://n7c4shn8ct4x.space.minimax.io';

interface ClickResult {
  selector: string;
  text: string;
  outcome: 'works' | 'broken' | 'stub' | 'noop';
  detail?: string;
}

interface RouteAudit {
  route: string;
  pageTitle?: string;
  pageText?: string;
  clickables: ClickResult[];
  errors: string[];
  notes: string[];
}

const ROUTES = [
  { path: '/', name: 'Root redirect' },
  { path: '/tasks', name: 'Tasks' },
  { path: '/calendar', name: 'Calendar' },
  { path: '/chat', name: 'Family Chat' },
  { path: '/parent-chat', name: 'Parent Chat' },
  { path: '/resources', name: 'Resources' },
  { path: '/history', name: 'History' },
  { path: '/achievements', name: 'Achievements' },
  { path: '/admin', name: 'Parent Dashboard' },
  { path: '/setup', name: 'Setup' },
  { path: '/profile-select', name: 'Profile Select' },
];

async function auditRoute(page: Page, route: { path: string; name: string }): Promise<RouteAudit> {
  const audit: RouteAudit = {
    route: route.path,
    clickables: [],
    errors: [],
    notes: [],
  };

  try {
    const url = `${APP_URL}${route.path}`;
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    if (!response) {
      audit.errors.push('no response');
      return audit;
    }
    if (response.status() >= 400) {
      audit.errors.push(`HTTP ${response.status()}`);
      return audit;
    }

    // Wait for React to hydrate
    await page.waitForTimeout(1500);

    audit.pageTitle = await page.title();
    audit.pageText = (await page.locator('body').textContent() || '').trim().slice(0, 200);

    // Capture page-level errors
    page.on('pageerror', (err) => audit.errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Skip noisy dev errors
        if (text.includes('favicon') || text.includes('manifest')) return;
        audit.errors.push(`console: ${text.slice(0, 100)}`);
      }
    });

    // Find all clickable elements
    const clickableSelectors = [
      'button:not([disabled])',
      'a[href]',
      '[role="button"]',
      'input[type="submit"]:not([disabled])',
      'input[type="checkbox"]',
      '[data-testid]',
      'summary',
    ];

    for (const selector of clickableSelectors) {
      const elements = await page.$$(selector);
      for (const el of elements) {
        try {
          const text = (await el.textContent() || '').trim().slice(0, 50);
          if (!text && !selector.includes('checkbox')) continue; // skip empty buttons

          // Skip nav links to other routes (we already visit them)
          const tagName = await el.evaluate(e => e.tagName.toLowerCase());
          if (tagName === 'a') {
            const href = await el.getAttribute('href');
            if (href && href.startsWith('/')) continue; // nav link, skip
          }

          // Get current URL before click
          const urlBefore = page.url();

          // Try to click
          await el.click({ trial: false, timeout: 2000 }).catch(() => {});

          await page.waitForTimeout(200);

          const urlAfter = page.url();

          if (urlBefore !== urlAfter) {
            audit.clickables.push({
              selector,
              text,
              outcome: 'works',
              detail: `navigated to ${urlAfter.replace(APP_URL, '')}`,
            });
          } else {
            // Check if anything visibly changed
            audit.clickables.push({
              selector,
              text: text || '(no text)',
              outcome: 'stub', // default assumption: clicked but no visible result
            });
          }
        } catch (err: any) {
          audit.clickables.push({
            selector,
            text: '(click failed)',
            outcome: 'broken',
            detail: err.message?.slice(0, 80),
          });
        }
      }
    }

    // Detect empty states
    const emptyStateWords = ['no ', 'coming soon', 'placeholder', 'TODO'];
    const bodyText = (await page.locator('body').textContent() || '').toLowerCase();
    for (const w of emptyStateWords) {
      if (bodyText.includes(w)) {
        audit.notes.push(`page contains "${w}" — possible empty/placeholder state`);
      }
    }

  } catch (err: any) {
    audit.errors.push(`route error: ${err.message}`);
  }

  return audit;
}

async function main() {
  console.log(`\n🔍 Click-every-clickable audit — ${APP_URL}\n`);
  console.log('━'.repeat(70));

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    const audits: RouteAudit[] = [];

    for (const route of ROUTES) {
      console.log(`\n📍 ${route.name} (${route.path})`);
      console.log('─'.repeat(70));
      const audit = await auditRoute(page, route);
      audits.push(audit);

      console.log(`   Title: ${audit.pageTitle || '(none)'}`);
      if (audit.errors.length > 0) {
        console.log(`   ⚠️  Errors:`);
        audit.errors.slice(0, 5).forEach(e => console.log(`      - ${e}`));
      }
      const works = audit.clickables.filter(c => c.outcome === 'works').length;
      const stubs = audit.clickables.filter(c => c.outcome === 'stub').length;
      const broken = audit.clickables.filter(c => c.outcome === 'broken').length;
      console.log(`   Clickables: ${works} works / ${stubs} stubs / ${broken} broken (total ${audit.clickables.length})`);

      if (audit.notes.length > 0) {
        console.log(`   📝 Notes:`);
        audit.notes.forEach(n => console.log(`      - ${n}`));
      }
    }

    await browser.close();

    // ─── SUMMARY ──────────────────────────────────────────────
    console.log('\n');
    console.log('━'.repeat(70));
    console.log('📊 SUMMARY');
    console.log('━'.repeat(70));

    const totalClicks = audits.reduce((s, a) => s + a.clickables.length, 0);
    const totalWorks = audits.reduce((s, a) => s + a.clickables.filter(c => c.outcome === 'works').length, 0);
    const totalStubs = audits.reduce((s, a) => s + a.clickables.filter(c => c.outcome === 'stub').length, 0);
    const totalBroken = audits.reduce((s, a) => s + a.clickables.filter(c => c.outcome === 'broken').length, 0);

    console.log(`Routes audited:     ${audits.length}`);
    console.log(`Clickables tested:  ${totalClicks}`);
    console.log(`  ✓ Works:          ${totalWorks} (${Math.round(totalWorks / totalClicks * 100)}%)`);
    console.log(`  ⚠ Stubs:          ${totalStubs} (${Math.round(totalStubs / totalClicks * 100)}%)`);
    console.log(`  ✗ Broken:         ${totalBroken} (${Math.round(totalBroken / totalClicks * 100)}%)`);

    console.log('\n🚨 TOP ISSUES (stubs + broken):');
    const issues = audits.flatMap(a =>
      a.clickables
        .filter(c => c.outcome !== 'works')
        .slice(0, 5)
        .map(c => ({ route: a.route, ...c }))
    );
    issues.slice(0, 25).forEach(i => {
      const sym = i.outcome === 'broken' ? '✗' : '⚠';
      console.log(`   ${sym} [${i.route}] "${i.text}" (${i.outcome})`);
    });

    console.log('\n✅ Routes with all clickables working:');
    for (const a of audits) {
      const allWork = a.clickables.length > 0 && a.clickables.every(c => c.outcome === 'works');
      const allStub = a.clickables.length > 0 && a.clickables.every(c => c.outcome === 'stub');
      if (allWork) console.log(`   ✓ ${a.route}`);
      if (allStub) console.log(`   ⚠ ${a.route} — ALL stubs (nothing actually does anything!)`);
    }

  } catch (err: any) {
    console.error('Audit failed:', err.message);
    process.exit(2);
  }
}

main();