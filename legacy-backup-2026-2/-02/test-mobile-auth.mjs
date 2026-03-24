import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  const logs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error' && !text.includes('favicon')) {
      errors.push(text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  
  try {
    console.log('Testing mobile auth flow simulation...');
    
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Load the page
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check if login page loads
    const rootHTML = await page.$eval('#root', el => el.innerHTML);
    const hasLoginForm = rootHTML.includes('Continue with Google') || rootHTML.includes('Sign in');
    const hasLoading = rootHTML.includes('Loading');
    
    console.log('\n=== MOBILE AUTH TEST ===');
    console.log('Viewport:', '375x667 (mobile)');
    console.log('Login form visible:', hasLoginForm ? 'YES' : 'NO');
    console.log('Loading spinner visible:', hasLoading ? 'YES' : 'NO');
    console.log('Console errors:', errors.length);
    
    // Check for console logs related to auth
    console.log('\n=== AUTH-RELATED LOGS ===');
    const authLogs = logs.filter(log => 
      log.includes('auth') || 
      log.includes('Auth') || 
      log.includes('redirect') ||
      log.includes('mobile') ||
      log.includes('Mobile')
    );
    authLogs.slice(0, 5).forEach((log, i) => console.log(`${i + 1}. ${log}`));
    
    if (errors.length > 0) {
      console.log('\n=== ERRORS ===');
      errors.slice(0, 5).forEach((e, i) => console.log(`${i + 1}. ${e.substring(0, 200)}`));
    }
    
    console.log('\n=== RESULT ===');
    if (hasLoginForm && errors.length === 0) {
      console.log('✓ Mobile login page loads correctly with no errors');
    } else {
      console.log('✗ Issues detected');
    }
    
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
