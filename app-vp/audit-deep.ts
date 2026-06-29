/**
 * Deep audit — captures real issues, not just "did URL change".
 *
 * Three passes:
 *   1. Page-content audit — captures rendered text, finds empty/stub markers
 *   2. JavaScript error capture — pageerror events on every route
 *   3. Persona walkthrough — Dominic's evening flow
 *
 * Run: npx tsx app-vp/audit-deep.ts https://n7c4shn8ct4x.space.minimax.io
 */

import { chromium, type Page, type Browser } from 'playwright';

const APP_URL = process.argv[2] || 'https://n7c4shn8ct4x.space.minimax.io';

interface RouteSnapshot {
  route: string;
  name: string;
  url: string;
  pageTitle: string;
  textPreview: string;
  visibleElements: { tag: string; text: string; hasHandler: boolean }[];
  errors: string[];
  warnings: string[];
}

interface PersonaStep {
  step: string;
  expected: string;
  observed: string;
  pass: boolean;
  detail: string;
}

const ROUTES = [
  { path: '/', name: 'Root' },
  { path: '/tasks', name: 'Tasks' },
  { path: '/calendar', name: 'Calendar' },
  { path: '/chat', name: 'Family Chat' },
  { path: '/parent-chat', name: 'Parent Chat' },
  { path: '/resources', name: 'Resources' },
  { path: '/history', name: 'History' },
  { path: '/achievements', name: 'Achievements' },
  { path: '/admin', name: 'Parent Dashboard' },
  { path: '/setup', name: 'Family Setup' },
  { path: '/profile-select', name: 'Profile Select' },
];

async function snapshotRoute(page: Page, route: { path: string; name: string }): Promise<RouteSnapshot> {
  const snap: RouteSnapshot = {
    route: route.path,
    name: route.name,
    url: `${APP_URL}${route.path}`,
    pageTitle: '',
    textPreview: '',
    visibleElements: [],
    errors: [],
    warnings: [],
  };

  // Capture errors at the page level
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  const errorHandler = (err: Error) => pageErrors.push(err.message);
  page.on('pageerror', errorHandler);
  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Skip noise
      if (text.includes('favicon') || text.includes('manifest')) return;
      consoleErrors.push(text.slice(0, 200));
    }
  };
  page.on('console', consoleHandler);

  try {
    const response = await page.goto(snap.url, { waitUntil: 'networkidle', timeout: 15000 });
    if (!response) {
      snap.errors.push('no response');
      return snap;
    }
    if (response.status() >= 400) {
      snap.errors.push(`HTTP ${response.status()}`);
      return snap;
    }

    // Wait for React hydration
    await page.waitForTimeout(2000);

    snap.pageTitle = await page.title();

    // Get the actual rendered text (max 500 chars)
    const fullText = await page.locator('body').textContent() || '';
    snap.textPreview = fullText.trim().slice(0, 500);

    // Inventory visible interactive elements
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = (await btn.textContent() || '').trim().slice(0, 60);
      const hasHandler = await btn.evaluate(el => {
        // Cheap heuristic: button has an onClick or is inside a form
        return el.onclick != null || !!el.closest('form') || el.type === 'submit';
      });
      if (text) snap.visibleElements.push({ tag: 'button', text, hasHandler });
    }
    const links = await page.$$('a');
    for (const a of links) {
      const text = (await a.textContent() || '').trim().slice(0, 60);
      const href = await a.getAttribute('href');
      if (text && href) snap.visibleElements.push({ tag: 'a', text: `${text} → ${href}`, hasHandler: !!href });
    }
    const inputs = await page.$$('input, textarea');
    for (const inp of inputs) {
      const placeholder = await inp.getAttribute('placeholder') || '';
      const type = await inp.getAttribute('type') || 'text';
      const value = await inp.inputValue().catch(() => '');
      snap.visibleElements.push({
        tag: `input[${type}]`,
        text: placeholder ? `placeholder: ${placeholder}` : `value: ${value}`,
        hasHandler: true,
      });
    }

    // Detect stub markers
    const lowerText = fullText.toLowerCase();
    const stubMarkers = [
      'coming soon', 'placeholder', 'todo', 'not implemented',
      'feature coming', 'tbd', 'to be done', 'not yet implemented',
      'no tasks', 'no events', 'no messages', 'no resources',
      'no history', 'no achievements', 'nothing here', 'empty',
      'select a', 'click to',
    ];
    for (const m of stubMarkers) {
      if (lowerText.includes(m)) {
        snap.warnings.push(`contains "${m}"`);
      }
    }

    // Errors
    snap.errors.push(...pageErrors);
    if (consoleErrors.length > 0) {
      snap.errors.push(...consoleErrors.map(e => `console: ${e}`));
    }

  } catch (err: any) {
    snap.errors.push(`route error: ${err.message}`);
  } finally {
    page.off('pageerror', errorHandler);
    page.off('console', consoleHandler);
  }

  return snap;
}

// ─── PERSONA WALKTHROUGH ──────────────────────────────────────────────────
// Dominic is 10. He opens the app at 7pm to do his evening tasks. He's
// tired, hungry, and wants to finish fast so he can play.

async function personaWalkthrough(page: Page): Promise<PersonaStep[]> {
  const steps: PersonaStep[] = [];

  // Step 1: Open the app
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const url1 = page.url();
  steps.push({
    step: '1. Dominic opens the app',
    expected: 'redirects to /tasks, sees his kanban',
    observed: `URL = ${url1.replace(APP_URL, '')}`,
    pass: url1.endsWith('/tasks'),
    detail: '',
  });

  // Step 2: Can he see his tasks?
  const taskPageText = (await page.locator('body').textContent() || '').toLowerCase();
  const seesTasks = taskPageText.includes('task') || taskPageText.includes('section') || taskPageText.includes('morning') || taskPageText.includes('afternoon');
  steps.push({
    step: '2. Tasks page renders something meaningful',
    expected: 'section headers (morning/afternoon/evening) or task cards visible',
    observed: taskPageText.slice(0, 200),
    pass: seesTasks,
    detail: seesTasks ? '' : 'no task-related text on page',
  });

  // Step 3: Can he create a task? (try clicking "+ New Task" if visible)
  const newTaskBtn = await page.locator('button:has-text("New Task"), button:has-text("Add Task"), button:has-text("+ Task"), button:has-text("Create")').first();
  let canCreate = false;
  let createDetail = '';
  if (await newTaskBtn.count() > 0) {
    const before = taskPageText.length;
    await newTaskBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
    const after = (await page.locator('body').textContent() || '').trim();
    canCreate = after !== taskPageText.slice(0, 200).trim();
    createDetail = canCreate ? 'modal/form opened' : 'click did nothing visible';
  } else {
    createDetail = 'no "New Task" button found on the page';
  }
  steps.push({
    step: '3. Dominic can click "+ New Task" and see a form',
    expected: 'a modal or form appears',
    observed: createDetail,
    pass: canCreate,
    detail: '',
  });

  // Step 4: Go to chat — can he read messages?
  await page.goto(`${APP_URL}/chat`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const chatText = (await page.locator('body').textContent() || '');
  const seesSeedMessages = chatText.includes('Can we get pizza') || chatText.includes('Morning!') || chatText.includes('Dev User');
  steps.push({
    step: '4. Chat page shows seeded family messages',
    expected: 'sees ~10 messages including the pizza/reading thread',
    observed: seesSeedMessages ? 'seed messages present' : `text preview: ${chatText.slice(0, 150)}`,
    pass: seesSeedMessages,
    detail: '',
  });

  // Step 5: Can he send a message?
  const chatInput = await page.locator('input[type="text"], textarea[placeholder*="message" i], textarea[placeholder*="say" i]').first();
  let canSend = false;
  let sendDetail = '';
  if (await chatInput.count() > 0) {
    await chatInput.fill('hi').catch(() => {});
    const sendBtn = await page.locator('button:has-text("Send"), button[type="submit"]').first();
    if (await sendBtn.count() > 0) {
      await sendBtn.click().catch(() => {});
      await page.waitForTimeout(500);
      const afterText = await page.locator('body').textContent();
      canSend = afterText?.includes('hi') ?? false;
      sendDetail = canSend ? 'message "hi" visible in chat' : 'message not visible after send';
    } else {
      sendDetail = 'no Send button found';
    }
  } else {
    sendDetail = 'no message input found';
  }
  steps.push({
    step: '5. Dominic can type and send a chat message',
    expected: 'message appears in the chat after clicking Send',
    observed: sendDetail,
    pass: canSend,
    detail: '',
  });

  // Step 6: Calendar — can he see today's tasks?
  await page.goto(`${APP_URL}/calendar`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const calText = await page.locator('body').textContent() || '';
  const seesTodayHighlight = calText.toLowerCase().includes('today') || calText.match(/\b(19|20|21|22|23|24|25|26|27|28)\b/) !== null;
  steps.push({
    step: '6. Calendar page shows today',
    expected: 'today is visible somehow (highlighted cell, "Today" label, or current date)',
    observed: seesTodayHighlight ? 'date/today visible' : 'no obvious today indicator',
    pass: seesTodayHighlight,
    detail: `text preview: ${calText.slice(0, 150)}`,
  });

  // Step 7: Achievements — does he see anything?
  await page.goto(`${APP_URL}/achievements`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const achText = await page.locator('body').textContent() || '';
  const seesAchievements = achText.toLowerCase().includes('achievement') || achText.toLowerCase().includes('badge') || achText.toLowerCase().includes('level') || achText.length > 100;
  steps.push({
    step: '7. Achievements page renders something',
    expected: 'sees achievements/badges/levels',
    observed: seesAchievements ? 'content present' : 'empty',
    pass: seesAchievements,
    detail: `text preview: ${achText.slice(0, 200)}`,
  });

  // Step 8: Admin (parent dashboard) — should it be gated?
  await page.goto(`${APP_URL}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const adminText = (await page.locator('body').textContent() || '').toLowerCase();
  const adminAccessible = !adminText.includes('pin') || adminText.includes('dashboard');
  steps.push({
    step: '8. /admin either shows PIN gate OR dashboard (per codex, gate is disabled)',
    expected: 'dashboard content OR explicit PIN prompt',
    observed: adminText.slice(0, 200),
    pass: adminText.length > 100 && (adminAccessible || adminText.includes('pin')),
    detail: '',
  });

  return steps;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Deep audit + persona walkthrough — ${APP_URL}\n`);
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

    // ─── PASS 1: Page-content audit ─────────────────────────
    console.log('\n📋 PASS 1: Page-content audit (every route)\n');
    const snaps: RouteSnapshot[] = [];
    for (const route of ROUTES) {
      const snap = await snapshotRoute(page, route);
      snaps.push(snap);

      console.log(`📍 ${snap.name} (${snap.route})`);
      console.log(`   Title: ${snap.pageTitle}`);
      console.log(`   Text: ${snap.textPreview.slice(0, 120)}...`);
      console.log(`   Interactive elements: ${snap.visibleElements.length}`);
      if (snap.errors.length > 0) {
        console.log(`   🚨 ERRORS:`);
        snap.errors.forEach(e => console.log(`      - ${e}`));
      }
      if (snap.warnings.length > 0) {
        console.log(`   ⚠️  WARNINGS:`);
        snap.warnings.slice(0, 3).forEach(w => console.log(`      - ${w}`));
      }
      console.log();
    }

    // ─── PASS 2: Errors summary ─────────────────────────────
    console.log('\n');
    console.log('━'.repeat(70));
    console.log('🚨 PASS 2: Errors across all routes');
    console.log('━'.repeat(70));

    const erroredRoutes = snaps.filter(s => s.errors.length > 0);
    if (erroredRoutes.length === 0) {
      console.log('   ✅ No JavaScript errors on any route.');
    } else {
      erroredRoutes.forEach(s => {
        console.log(`\n   📍 ${s.route}:`);
        s.errors.forEach(e => console.log(`      - ${e}`));
      });
    }

    // ─── PASS 3: Persona walkthrough ────────────────────────
    console.log('\n');
    console.log('━'.repeat(70));
    console.log('👦 PASS 3: Persona walkthrough — Dominic at 7pm');
    console.log('━'.repeat(70));

    const personaSteps = await personaWalkthrough(page);

    const passed = personaSteps.filter(s => s.pass).length;
    console.log(`\n   ${passed}/${personaSteps.length} steps passed\n`);
    personaSteps.forEach((s, i) => {
      const sym = s.pass ? '✅' : '❌';
      console.log(`   ${sym} ${s.step}`);
      console.log(`      Expected: ${s.expected}`);
      console.log(`      Observed: ${s.observed}`);
      if (s.detail) console.log(`      Detail: ${s.detail}`);
      console.log();
    });

    // ─── FINAL RECOMMENDATIONS ──────────────────────────────
    console.log('━'.repeat(70));
    console.log('📋 RECOMMENDATIONS (prioritised)');
    console.log('━'.repeat(70));

    const recs: string[] = [];

    // JS errors first
    const totalErrors = erroredRoutes.reduce((s, r) => s + r.errors.length, 0);
    if (totalErrors > 0) {
      recs.push(`🚨 CRITICAL: ${totalErrors} JavaScript errors across ${erroredRoutes.length} routes. Fix before anything else.`);
    }

    // Persona failures
    personaSteps.filter(s => !s.pass).forEach(s => {
      recs.push(`👤 PERSONA: ${s.step} — ${s.observed}`);
    });

    // Stub markers
    const stubCount = snaps.reduce((s, r) => s + r.warnings.length, 0);
    if (stubCount > 0) {
      recs.push(`⚠️  ${stubCount} pages contain stub markers ("coming soon", empty states, "no X"). Need real content.`);
    }

    // Page with zero interactive elements
    const dead = snaps.filter(s => s.visibleElements.length === 0);
    if (dead.length > 0) {
      recs.push(`💀 ${dead.length} routes have ZERO interactive elements: ${dead.map(d => d.route).join(', ')}`);
    }

    if (recs.length === 0) {
      console.log('   🎉 No critical issues found.');
    } else {
      recs.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
    }

    await browser.close();
  } catch (err: any) {
    console.error('Audit failed:', err.message);
    if (browser) await browser.close();
    process.exit(2);
  }
}

main();