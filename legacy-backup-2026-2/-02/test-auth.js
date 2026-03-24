import { chromium } from 'playwright';

async function testAuthFlow() {
  console.log('Starting auth flow test...');

  const browser = await chromium.launch({
    headless: true
  });

  // Test 1: Desktop browser
  console.log('\n=== Test 1: Desktop Browser ===');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const desktopPage = await desktopContext.newPage();

  // Capture console messages
  const desktopLogs = [];
  desktopPage.on('console', msg => {
    const text = msg.text();
    desktopLogs.push({ type: msg.type(), text });
    if (text.includes('[Auth]') || text.includes('[Error]') || text.includes('403') || text.includes('disallowed')) {
      console.log(`  [${msg.type()}] ${text}`);
    }
  });

  desktopPage.on('pageerror', err => {
    console.log('  [PAGE ERROR]', err.message);
  });

  try {
    console.log('  Navigating to https://dominicstasks.pages.dev...');
    await desktopPage.goto('https://dominicstasks.pages.dev', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for auth to initialize
    await desktopPage.waitForTimeout(3000);

    // Check current URL
    console.log('  Current URL:', desktopPage.url());

    // Check for loading state
    const loadingText = await desktopPage.textContent('body');
    if (loadingText.includes('Loading')) {
      console.log('  Still loading...');
    }

    // Print auth-related logs
    console.log('\n  Auth-related logs:');
    desktopLogs.filter(log => log.text.includes('[Auth]')).forEach(log => {
      console.log(`    ${log.text}`);
    });

  } catch (error) {
    console.log('  Error:', error.message);
  }

  await desktopContext.close();

  // Test 2: Mobile browser simulation
  console.log('\n=== Test 2: Mobile Browser (iPhone 12 simulation) ===');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileContext.newPage();

  const mobileLogs = [];
  mobilePage.on('console', msg => {
    const text = msg.text();
    mobileLogs.push({ type: msg.type(), text });
    if (text.includes('[Auth]') || text.includes('[Error]') || text.includes('403') || text.includes('disallowed')) {
      console.log(`  [${msg.type()}] ${text}`);
    }
  });

  mobilePage.on('pageerror', err => {
    console.log('  [PAGE ERROR]', err.message);
  });

  try {
    console.log('  Navigating to https://dominicstasks.pages.dev...');
    await mobilePage.goto('https://dominicstasks.pages.dev', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await mobilePage.waitForTimeout(3000);
    console.log('  Current URL:', mobilePage.url());

    console.log('\n  Auth-related logs:');
    mobileLogs.filter(log => log.text.includes('[Auth]')).forEach(log => {
      console.log(`    ${log.text}`);
    });

  } catch (error) {
    console.log('  Error:', error.message);
  }

  await mobileContext.close();

  // Test 3: Check if login button is visible
  console.log('\n=== Test 3: Check Login Page Elements ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    console.log('  Current URL:', page.url());

    // Look for login-related elements
    const loginButton = await page.$('button:has-text("Sign in")');
    const googleButton = await page.$('button:has-text("Google")');
    const loadingScreen = await page.$('text=Loading');

    console.log('  Login button found:', !!loginButton);
    console.log('  Google button found:', !!googleButton);
    console.log('  Loading screen visible:', !!loadingScreen);

  } catch (error) {
    console.log('  Error:', error.message);
  }

  await context.close();
  await browser.close();

  console.log('\n=== Test Complete ===');
  console.log('Check the logs above for any errors or auth issues.');
}

testAuthFlow().catch(console.error);
