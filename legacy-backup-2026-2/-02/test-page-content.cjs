const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Checking what\'s on the landing page ===\n');
  
  await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  
  // Get all button text
  const buttons = await page.$$eval('button', buttons => buttons.map(b => b.textContent));
  console.log('\nButtons found:', buttons.length);
  buttons.forEach((text, i) => console.log(`  ${i + 1}. "${text}"`));
  
  // Get all links
  const links = await page.$$eval('a', links => links.map(l => l.textContent));
  console.log('\nLinks found:', links.length);
  links.slice(0, 10).forEach((text, i) => console.log(`  ${i + 1}. "${text}"`));
  
  // Get visible text
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\nPage content preview (first 500 chars):');
  console.log(bodyText.substring(0, 500));
  
  // Check if we're stuck on loading
  const loading = await page.$('text=Loading');
  if (loading) {
    console.log('\n⚠️ Stuck on loading screen!');
  }
  
  // Check for sign in text
  const signInText = await page.$('text=Sign in');
  if (signInText) {
    console.log('\n✓ Found "Sign in" text on page');
  } else {
    console.log('\n✗ No "Sign in" text found on page');
  }

  await browser.close();
})();
