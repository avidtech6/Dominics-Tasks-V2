import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const requests = [];
  const responses = [];

  // Track all requests
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      time: Date.now()
    });
  });

  // Track responses
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      time: Date.now()
    });
  });

  try {
    console.log('Loading app...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get initial state
    console.log('Initial URL:', page.url());
    const button = await page.$('button');
    console.log('Button found:', !!button);

    console.log('\n=== CLICKING ===');
    await button.click();

    // Wait for any navigation to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== FINAL URL ===');
    console.log('URL:', page.url());

    console.log('\n=== REQUESTS MADE ===');
    requests.forEach((r, i) => {
      if (r.url.includes('google') || r.url.includes('firebase') || r.url.includes('dominicstasks')) {
        console.log(`${i + 1}. ${r.method} ${r.url}`);
      }
    });

    console.log('\n=== RESPONSES ===');
    responses.forEach((r, i) => {
      if (r.status >= 400 || r.url.includes('google') || r.url.includes('firebase')) {
        console.log(`${i + 1}. ${r.status} ${r.url}`);
      }
    });

    console.log('\n=== PAGE CONTENT ===');
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(bodyText.substring(0, 400));

  } catch (err) {
    console.error('Test failed:', err.message);
  }

  await browser.close();
})();
