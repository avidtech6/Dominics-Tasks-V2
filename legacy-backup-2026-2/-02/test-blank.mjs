import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const logs = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    logs.push(`[${type}] ${text}`);

    if (type === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push(`PageError: ${err.message}`);
  });

  try {
    console.log('Testing redirect auth...');
    await page.goto('https://38026e53.dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check initial state
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasLogin = bodyText.includes('Sign in') || bodyText.includes('Google');

    console.log('\n=== INITIAL STATE ===');
    console.log('Title:', title);
    console.log('Has login content:', hasLogin);
    console.log('Body text preview:', bodyText.substring(0, 200));

    // Look for the sign-in button
    const signInButton = await page.$('button');
    console.log('Sign-in button found:', !!signInButton);

    if (signInButton) {
      console.log('Clicking sign-in button...');
      await signInButton.click();

      // Wait for redirect (redirect auth should navigate away)
      console.log('Waiting for redirect...');
      await page.waitForTimeout(3000);

      // Check current URL (should have changed for redirect auth)
      const currentUrl = page.url();
      console.log('\n=== AFTER SIGN-IN CLICK ===');
      console.log('Current URL:', currentUrl);
      console.log('URL changed (redirect working):', !currentUrl.includes('38026e53'));
    }

    // Check all errors
    if (errors.length > 0) {
      console.log('\n=== ERRORS ===');
      errors.slice(0, 10).forEach((e, i) => console.log(`${i + 1}. ${e.substring(0, 300)}`));
    } else {
      console.log('\n=== NO ERRORS - Auth flow working! ===');
    }

    console.log('\n=== CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
