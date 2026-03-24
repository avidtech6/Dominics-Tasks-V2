import { chromium } from 'playwright';

(async () => {
  console.log('=== Click Test & Playwright Audit ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  const consoleMessages = [];
  const errors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('1. Loading app...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('   ✓ Page loaded');
    
    console.log('\n2. Checking page structure...');
    const title = await page.title();
    console.log(`   Title: ${title}`);
    
    // Check for root element
    const rootExists = await page.$('#root');
    console.log(`   Root element: ${rootExists ? '✓ Found' : '✗ Not found'}`);
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    console.log('\n3. Looking for interactive elements...');
    const allButtons = await page.$$('button');
    console.log(`   Total buttons found: ${allButtons.length}`);
    
    // Look for sign-in related elements
    const signInButton = await page.$('button:has-text("Sign")');
    if (signInButton) {
      const buttonText = await signInButton.textContent();
      const isVisible = await signInButton.isVisible();
      const isDisabled = await signInButton.isDisabled();
      console.log(`   Sign-in button: "${buttonText}"`);
      console.log(`   - Visible: ${isVisible}`);
      console.log(`   - Disabled: ${isDisabled}`);
      
      console.log('\n4. Clicking sign-in button...');
      await signInButton.click();
      console.log('   ✓ Clicked');
      
      // Wait for any navigation or popup
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);
      
      // Check if we were redirected
      if (currentUrl.includes('google') || currentUrl.includes('accounts.google')) {
        console.log('   ✓ Redirected to Google for authentication');
      } else if (currentUrl.includes('dominicstasks')) {
        console.log('   ✓ Stayed on app domain');
        
        // Check for any error messages
        const errorText = await page.$eval('body', el => el.innerText).catch(() => '');
        if (errorText.toLowerCase().includes('error')) {
          console.log('   ⚠ Error message detected on page');
        }
      }
    } else {
      console.log('   ✗ No sign-in button found');
      
      // Check if already logged in
      const bodyText = await page.$eval('body', el => el.innerText).catch(() => '');
      if (bodyText.includes('Task') || bodyText.includes('task')) {
        console.log('   ✓ App rendered - may already be logged in or on dashboard');
      }
    }
    
    console.log('\n5. Console errors:');
    const jsErrors = consoleMessages.filter(msg => msg.type === 'error');
    if (jsErrors.length === 0) {
      console.log('   ✓ No JavaScript errors');
    } else {
      jsErrors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.text.substring(0, 150)}`);
      });
    }
    
    console.log('\n6. Network errors:');
    if (networkErrors.length === 0) {
      console.log('   ✓ No network errors');
    } else {
      networkErrors.slice(0, 5).forEach(err => {
        console.log(`   - ${err}`);
      });
    }
    
    console.log('\n7. All console messages:');
    const authMessages = consoleMessages.filter(msg => 
      msg.text.includes('Auth') || 
      msg.text.includes('auth') ||
      msg.text.includes('firebase') ||
      msg.text.includes('signIn')
    );
    
    if (authMessages.length === 0) {
      console.log('   (no auth-related messages)');
    } else {
      authMessages.slice(0, 10).forEach(msg => {
        console.log(`   [${msg.type}] ${msg.text.substring(0, 100)}`);
      });
    }
    
    console.log('\n8. Page content check:');
    const bodyContent = await page.$eval('body', el => ({
      hasContent: el.innerText.length > 0,
      textPreview: el.innerText.substring(0, 200)
    }));
    console.log(`   Has content: ${bodyContent.hasContent}`);
    console.log(`   Preview: ${bodyContent.textPreview.replace(/\n/g, ' | ')}`);
    
  } catch (error) {
    console.log(`\nError during test: ${error.message}`);
  }
  
  await browser.close();
  
  console.log('\n=== Audit Complete ===');
})();
