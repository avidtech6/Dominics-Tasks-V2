const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    // Filter for important messages
    if (text.includes('[Auth]') || text.includes('[FamilyContext]') || text.includes('[TasksContext]') || text.includes('Error') || text.includes('error')) {
      console.log('Console:', text);
    }
  });

  page.on('pageerror', error => {
    console.log('Page Error:', error.message);
  });

  console.log('=== Testing login flow to /tasks ===\n');
  console.log('1. Going to landing page...');
  await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Current URL:', page.url());

  // Click sign in button
  const signInButton = await page.$('button:has-text("Sign in")');
  if (signInButton) {
    console.log('\n2. Clicking Sign in button...');
    await signInButton.click();
    
    // Wait for navigation or any changes
    await page.waitForTimeout(5000);
    console.log('Current URL after sign in:', page.url());
    console.log('Page title:', await page.title());
    
    // Wait a bit more for any redirects
    await page.waitForTimeout(3000);
    console.log('Final URL:', page.url());
    
    // Check if we're on tasks page
    if (page.url().includes('/tasks')) {
      console.log('\n✓ SUCCESS: On /tasks page');
      // Check for any visible content
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('Page has content:', bodyText.length > 0 ? 'Yes' : 'No');
      if (bodyText.length > 0 && bodyText.length < 200) {
        console.log('Content preview:', bodyText.substring(0, 200));
      }
    } else if (page.url().includes('/profile-select')) {
      console.log('\n✗ ISSUE: Redirected to /profile-select');
    } else {
      console.log('\n? On page:', page.url());
    }
  } else {
    console.log('No sign in button found');
  }

  await browser.close();
  console.log('\nTest complete');
})();
