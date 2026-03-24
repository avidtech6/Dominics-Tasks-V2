import { chromium } from 'playwright';

async function testMobileAuth() {
  console.log('Starting mobile auth simulation test...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    // Simulate mobile browser
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  // Collect console messages
  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`Page error: ${err.message}`);
  });

  try {
    // Test 1: Load the page normally
    console.log('=== TEST 1: Normal page load ===');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check if main elements exist
    const hasRoot = await page.$('#root');
    console.log(`Has #root element: ${!!hasRoot}`);

    // Check for debug panel
    const debugPanel = await page.$('.fixed.bottom-0');
    console.log(`Has debug panel: ${!!debugPanel}`);

    // Test 2: Simulate OAuth redirect by loading with params
    console.log('\n=== TEST 2: Simulating OAuth redirect with URL params ===');
    await page.goto('https://dominicstasks.pages.dev/?code=abc123&state=xyz789', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if page reloaded (URL should be clean)
    const currentUrl = page.url();
    console.log(`Current URL after redirect simulation: ${currentUrl}`);

    const hasParams = currentUrl.includes('?code=') || currentUrl.includes('?state=');
    console.log(`URL still has params: ${hasParams}`);

    if (!hasParams) {
      console.log('✅ Page successfully stripped OAuth params (reload worked!)');
    }

    // Report console logs
    console.log('\n=== Console Logs ===');
    consoleLogs.forEach(log => console.log(log));

    if (consoleErrors.length > 0) {
      console.log('\n=== Console Errors ===');
      consoleErrors.forEach(err => console.log(`❌ ${err}`));
    } else {
      console.log('\n✅ No console errors detected');
    }

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n=== Test Complete ===');
}

testMobileAuth();
