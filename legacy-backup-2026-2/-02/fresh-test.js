import { chromium } from 'playwright';

(async () => {
  console.log('=== Fresh Start Test ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const logs = [];
  
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  
  try {
    console.log('1. Fresh page load (new context - no cookies)...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('\n2. Waiting for auth to initialize (3 seconds)...');
    await page.waitForTimeout(3000);
    
    console.log('\n3. Checking button state immediately:');
    const button = await page.$('button');
    if (button) {
      const text = await button.textContent();
      const isDisabled = await button.isDisabled();
      console.log(`   Button text: "${text}"`);
      console.log(`   Disabled: ${isDisabled}`);
      
      if (text.includes('Signing in')) {
        console.log('\n⚠️ Button stuck in signing state!');
        console.log('   Trying to force reload and bypass auth...');
        
        // Reload with clean state
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        const button2 = await page.$('button');
        if (button2) {
          const text2 = await button2.textContent();
          console.log(`   After reload: "${text2}"`);
        }
      }
    } else {
      console.log('   No button found');
    }
    
    console.log('\n4. All auth-related logs:');
    const authLogs = logs.filter(log => 
      log.text.includes('[Auth]') || 
      log.text.includes('auth') ||
      log.text.includes('Auth')
    );
    
    if (authLogs.length === 0) {
      console.log('   (none)');
    } else {
      authLogs.forEach(log => {
        console.log(`   ${log.text}`);
      });
    }
    
    console.log('\n5. Current URL and page state:');
    console.log(`   URL: ${page.url()}`);
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 200));
    console.log(`   Preview: ${pageText.replace(/\n/g, ' | ')}`);
    
  } catch (error) {
    console.log(`\nError: ${error.message}`);
  }
  
  await browser.close();
  
  console.log('\n=== Complete ===');
})();
