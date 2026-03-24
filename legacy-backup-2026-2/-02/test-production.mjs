import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  const consoleMessages = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text.substring(0, 300)}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  
  try {
    console.log('Loading production site...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const content = await page.content();
    const rootContent = await page.$eval('#root', el => el.innerHTML.substring(0, 500));
    
    console.log('\n=== PRODUCTION TEST ===');
    console.log('Page title:', await page.title());
    console.log('Root content:', rootContent ? rootContent.substring(0, 200) + '...' : 'EMPTY!');
    console.log('Total content length:', content.length);
    console.log('Console errors:', errors.length);
    
    if (errors.length > 0) {
      console.log('\n=== ERRORS ===');
      errors.forEach((e, i) => console.log(`${i + 1}. ${e.substring(0, 300)}`));
    }
    
    // Show first few console messages
    console.log('\n=== FIRST 10 CONSOLE MESSAGES ===');
    consoleMessages.slice(0, 10).forEach((m, i) => console.log(`${i + 1}. ${m}`));
    
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
