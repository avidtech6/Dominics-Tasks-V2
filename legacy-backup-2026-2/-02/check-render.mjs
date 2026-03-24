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
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    
    // Check for React hydration
    const hydration = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        innerHTML: root ? root.innerHTML.length : 0,
        childrenCount: root ? root.children.length : 0,
        textContent: root ? root.textContent?.substring(0, 300) : 'NO ROOT'
      };
    });
    
    console.log('=== RENDER STATUS ===');
    console.log('Root HTML length:', hydration.innerHTML);
    console.log('Root children count:', hydration.childrenCount);
    console.log('Root text content:', hydration.textContent);
    
    console.log('\n=== ALL CONSOLE LOGS ===');
    logs.forEach((log, i) => {
      if (i < 15) console.log(log);
    });
    
    console.log('\n=== ERRORS ===');
    if (errors.length === 0) {
      console.log('No errors found!');
    } else {
      errors.forEach((e, i) => console.log(`${i + 1}. ${e.substring(0, 200)}`));
    }
    
    // Take screenshot
    await page.screenshot({ path: '/workspace/screenshot.png', fullPage: true });
    console.log('\nScreenshot saved to /workspace/screenshot.png');
    
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
