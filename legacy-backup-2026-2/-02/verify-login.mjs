import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('ERROR:', msg.text().substring(0, 200));
    }
  });
  
  await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Check what's in the root
  const rootHTML = await page.$eval('#root', el => el.innerHTML);
  const hasLoginForm = rootHTML.includes('Sign in') || rootHTML.includes('Google');
  const hasLoading = rootHTML.includes('Loading');
  const isEmpty = rootHTML.trim().length === 0;
  
  console.log('=== LOGIN PAGE CHECK ===');
  console.log('Root is empty:', isEmpty ? 'YES (BAD)' : 'NO (GOOD)');
  console.log('Has login form:', hasLoginForm ? 'YES (GOOD)' : 'NO');
  console.log('Has loading spinner:', hasLoading ? 'YES' : 'NO');
  console.log('Root HTML length:', rootHTML.length);
  
  // Check for login button
  const loginButton = await page.$('button:has-text("Sign in")');
  console.log('Sign in button found:', loginButton ? 'YES' : 'NO');
  
  // Check page structure
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('\nPage visible text:', bodyText.substring(0, 100) + '...');
  
  await browser.close();
})();
