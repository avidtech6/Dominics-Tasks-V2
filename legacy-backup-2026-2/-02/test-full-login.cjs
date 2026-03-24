const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Auth]') || text.includes('[FamilyContext]') || text.includes('Error') || text.includes('navigate') || text.includes('Navigate')) {
      console.log('Console:', text);
    }
  });

  console.log('=== Full Login Flow Test ===\n');
  
  // Step 1: Go to landing page
  console.log('1. Going to landing page...');
  await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('   URL:', page.url());
  
  // Step 2: Click "Continue with Google"
  console.log('\n2. Clicking "Continue with Google"...');
  const continueButton = await page.$('button:has-text("Continue with Google")');
  if (continueButton) {
    await continueButton.click();
    
    // Wait for Google OAuth or redirect
    console.log('   Waiting for redirect...');
    await page.waitForTimeout(8000);
    console.log('   Current URL:', page.url());
    
    // If redirected to Google, we'd see accounts.google.com
    if (page.url().includes('accounts.google.com')) {
      console.log('   → Redirected to Google for login');
      console.log('   (This is expected - Playwright can\'t complete Google OAuth)');
    } else if (page.url().includes('dominicstasks')) {
      console.log('   → Back on dominicstasks');
      
      // Wait a bit more for any redirects
      await page.waitForTimeout(3000);
      console.log('   Final URL:', page.url());
      
      // Check where we ended up
      if (page.url().includes('/tasks')) {
        console.log('\n✓ SUCCESS: Landed on /tasks');
      } else if (page.url().includes('/profile-select')) {
        console.log('\n✗ ISSUE: Landed on /profile-select');
      } else if (page.url().includes('/setup')) {
        console.log('\n→ Landed on /setup (needs setup)');
      } else {
        console.log('\n? Landed on:', page.url());
      }
    }
  } else {
    console.log('   Could not find "Continue with Google" button');
  }

  await browser.close();
  console.log('\nTest complete');
})();
