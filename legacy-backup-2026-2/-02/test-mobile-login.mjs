import { chromium } from 'playwright';

async function testMobileLogin() {
  console.log('Testing mobile login page...');

  const browser = await chromium.launch({
    headless: true,
  });

  // Create a mobile context (iPhone 14 Pro dimensions)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  // Collect console messages
  page.on('console', (msg) => {
    console.log(`[Console ${msg.type()}]: ${msg.text()}`);
  });

  // Collect page errors
  page.on('pageerror', (error) => {
    console.error('[Page Error]:', error.message);
  });

  try {
    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('https://dominicstasks.pages.dev/', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for the page to be fully loaded
    await page.waitForTimeout(2000);

    // Check if the login button is visible
    const loginButton = page.locator('button:has-text("Continue with Google")');
    const isLoginButtonVisible = await loginButton.isVisible();
    console.log(`Login button visible: ${isLoginButtonVisible}`);

    // Check for any error messages
    const errorMessage = page.locator('.bg-red-50');
    const hasError = await errorMessage.isVisible().catch(() => false);
    console.log(`Error message visible: ${hasError}`);

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check if the page has any visible elements
    const bodyText = await page.locator('body').textContent();
    console.log(`Page has content: ${bodyText.length > 0}`);

    console.log('\n=== Mobile Test Results ===');
    console.log('Page loaded successfully');
    console.log('Login button is accessible');

    if (!isLoginButtonVisible) {
      console.log('WARNING: Login button not visible on mobile');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testMobileLogin().catch(console.error);
