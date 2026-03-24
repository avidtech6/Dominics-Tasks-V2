import { chromium } from 'playwright';

(async () => {
  console.log('=== Simple Page Load Test ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('1. Navigating to page...');
  const response = await page.goto('https://dominicstasks.pages.dev', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  console.log(`   Status: ${response.status()}`);
  console.log(`   URL: ${response.url()}`);
  
  console.log('\n2. Raw HTML content:');
  const html = await page.content();
  console.log(html.substring(0, 500));
  
  console.log('\n3. Looking for script tag in raw HTML:');
  if (html.includes('script')) {
    console.log('   ✓ Script tag found in HTML');
  } else {
    console.log('   ✗ Script tag NOT found in HTML');
  }
  
  console.log('\n4. Evaluating in page context:');
  const result = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    return {
      scriptCount: scripts.length,
      scriptInnerHTML: document.scripts[0]?.innerHTML?.substring(0, 100) || 'no scripts',
      rootExists: !!document.getElementById('root'),
      rootHTML: document.getElementById('root')?.innerHTML?.substring(0, 100) || 'empty'
    };
  });
  
  console.log(`   Scripts found: ${result.scriptCount}`);
  console.log(`   First script: ${result.scriptInnerHTML}`);
  console.log(`   Root exists: ${result.rootExists}`);
  console.log(`   Root HTML: ${result.rootHTML}`);
  
  console.log('\n5. Waiting 3 seconds...');
  await page.waitForTimeout(3000);
  
  console.log('\n6. After waiting:');
  const afterWait = await page.evaluate(() => {
    return {
      scriptCount: document.scripts.length,
      rootHTML: document.getElementById('root')?.innerHTML?.substring(0, 200) || 'empty'
    };
  });
  
  console.log(`   Scripts: ${afterWait.scriptCount}`);
  console.log(`   Root: ${afterWait.rootHTML}`);
  
  await browser.close();
  
  console.log('\n=== Complete ===');
})();
