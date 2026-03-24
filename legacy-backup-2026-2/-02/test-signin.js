import { chromium } from 'playwright';

(async () => {
  console.log('=== Testing Sign-In Flow ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  
  page.on('pageerror', error => {
    logs.push({ type: 'error', text: error.message });
  });
  
  try {
    console.log('1. Loading app...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('   ✓ Page loaded');
    
    console.log('\n2. Checking page content...');
    await page.waitForTimeout(2000);
    
    const content = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log(`   Content preview: ${content.replace(/\n/g, ' | ')}`);
    
    console.log('\n3. Looking for sign-in button...');
    const signInButton = await page.$('button');
    
    if (signInButton) {
      const buttonText = await signInButton.textContent();
      console.log(`   Found: "${buttonText}"`);
      
      console.log('\n4. Clicking sign-in button...');
      await signInButton.click();
      console.log('   ✓ Clicked');
      
      console.log('\n5. Waiting for redirect or response (10 seconds)...');
      await page.waitForTimeout(10000);
      
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);
      
      // Check for any changes
      const newContent = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log(`\n6. Content after click: ${newContent.replace(/\n/g, ' | ')}`);
      
      if (currentUrl.includes('google') || currentUrl.includes('accounts.google')) {
        console.log('\n✓ ✓ ✓ SUCCESS! Redirected to Google for authentication!');
      } else if (currentUrl.includes('dominicstasks')) {
        console.log('\n⚠ Still on app domain - checking for errors...');
        
        if (newContent.toLowerCase().includes('error') || newContent.toLowerCase().includes('unauthorized')) {
          console.log('Error detected in page content');
        }
      }
      
    } else {
      console.log('   ✗ No button found');
      
      const bodyHtml = await page.$eval('body', el => el.innerHTML);
      if (bodyHtml.includes('root')) {
        console.log('   App container found but no interactive elements');
      }
    }
    
    console.log('\n7. Console logs:');
    const authLogs = logs.filter(log => 
      log.text.includes('Auth') || 
      log.text.includes('auth') ||
      log.text.includes('signIn') ||
      log.text.includes('redirect') ||
      log.text.includes('firebase') ||
      log.text.includes('error') ||
      log.type === 'error'
    );
    
    if (authLogs.length === 0) {
      console.log('   (no relevant logs)');
    } else {
      authLogs.forEach(log => {
        console.log(`   [${log.type}] ${log.text.substring(0, 150)}`);
      });
    }
    
  } catch (error) {
    console.log(`\nError: ${error.message}`);
  }
  
  await browser.close();
  
  console.log('\n=== Test Complete ===');
})();
