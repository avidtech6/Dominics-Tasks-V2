import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const logs = [];
  const networkRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error' && !text.includes('Partitioned cookie')) {
      errors.push(text);
    }
  });

  page.on('pageerror', err => errors.push(`PageError: ${err.message}`));

  page.on('requestfailed', request => {
    networkRequests.push(`FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('Loading app...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get initial state
    const initialUrl = page.url();
    console.log('Initial URL:', initialUrl);

    const initialHtml = await page.content();
    console.log('Page has button:', initialHtml.includes('button'));

    // Find the button and get its text
    const button = await page.$('button');
    const buttonText = button ? await button.textContent() : 'NO BUTTON';
    console.log('Button text:', buttonText);

    // Click and watch closely
    console.log('\n=== CLICKING SIGN-IN ===');
    await button.click();

    // Capture every change in the first 3 seconds
    console.log('Immediately after click, URL:', page.url());

    for (let i = 1; i <= 6; i++) {
      await page.waitForTimeout(500);
      const url = page.url();
      const html = await page.content();
      const bodyText = await page.evaluate(() => document.body.innerText);

      console.log(`[${i * 0.5}s] URL: ${url}`);

      if (url !== page.url()) {
        console.log(`  -> URL changed!`);
      }
    }

    // Final state
    console.log('\n=== FINAL STATE ===');
    console.log('Final URL:', page.url());
    const finalBodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body preview:', finalBodyText.substring(0, 300));

    console.log('\n=== NETWORK ERRORS ===');
    networkRequests.forEach(r => console.log(r));

    console.log('\n=== CONSOLE ERRORS ===');
    errors.forEach(e => console.log(e));

    console.log('\n=== ALL LOGS ===');
    logs.forEach(l => console.log(l));

  } catch (err) {
    console.error('Test failed:', err.message);
  }

  await browser.close();
})();
