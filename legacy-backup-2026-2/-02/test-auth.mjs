import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const logs = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    // Skip partition cookie warnings
    if (msg.type() === 'error' && !text.includes('Partitioned cookie')) {
      errors.push(text);
    }
  });

  page.on('pageerror', err => errors.push(`PageError: ${err.message}`));

  try {
    console.log('Loading app...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check page loaded
    const title = await page.title();
    console.log('Title:', title);

    // Find and click sign-in button
    const button = await page.$('button');
    if (button) {
      console.log('Found button, clicking...');
      await button.click();
      console.log('Clicked, waiting...');

      // Wait and check what happens
      await page.waitForTimeout(5000);

      const url = page.url();
      console.log('Current URL:', url);

      // Check if we were redirected to Google
      if (url.includes('google')) {
        console.log('SUCCESS: Redirected to Google for sign-in');
      } else if (url.includes('dominicstasks')) {
        console.log('STILL ON APP - checking for errors...');

        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log('Body preview:', bodyText.substring(0, 300));
      }
    }

    console.log('\n=== ERRORS ===');
    if (errors.length === 0) {
      console.log('No critical errors');
    } else {
      errors.forEach(e => console.log(e));
    }

    console.log('\n=== ALL LOGS ===');
    logs.forEach(l => console.log(l));

  } catch (err) {
    console.error('Test failed:', err.message);
  }

  await browser.close();
})();
