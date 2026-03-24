import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`Page error: ${err.message}`);
  });

  try {
    console.log('Navigating to dominicstasks.pages.dev...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('Page loaded successfully!');

    // Wait a bit for any async operations
    await page.waitForTimeout(3000);

    // Check for the login button
    const loginButton = await page.locator('button:has-text("Continue with Google")').first();
    if (await loginButton.isVisible()) {
      console.log('✓ Login button is visible');
    } else {
      console.log('✗ Login button not found');
      errors.push('Login button not found');
    }

    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    if (errors.length === 0) {
      console.log('\n✓ No console errors detected');
      console.log('✓ Authentication page loaded successfully!');
    } else {
      console.log('\n✗ Errors detected:');
      errors.forEach(e => console.log(`  - ${e}`));
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    errors.push(error.message);
  }

  await browser.close();

  process.exit(errors.length > 0 ? 1 : 0);
})();
