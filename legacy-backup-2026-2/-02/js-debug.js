import { chromium } from 'playwright';

(async () => {
  console.log('=== Deep JavaScript Debug ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const allEvents = [];
  
  page.on('console', msg => {
    allEvents.push({ type: 'console', subtype: msg.type(), text: msg.text() });
  });
  
  page.on('pageerror', error => {
    allEvents.push({ type: 'pageerror', text: error.message, stack: error.stack });
  });
  
  page.on('request', request => {
    if (request.url().includes('.js')) {
      allEvents.push({ type: 'request', url: request.url(), status: request.response()?.status() });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('.js') || response.status() >= 400) {
      allEvents.push({ type: 'response', url: response.url(), status: response.status() });
    }
  });
  
  try {
    console.log('1. Loading page with full tracing...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'load', timeout: 30000 });
    
    console.log('2. Waiting 5 seconds for JS execution...');
    await page.waitForTimeout(5000);
    
    console.log('\n3. Checking if JavaScript is enabled:');
    const jsEnabled = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    console.log(`   JS enabled: ${jsEnabled}`);
    
    console.log('\n4. Checking script tags:');
    const scripts = await page.$$('script');
    console.log(`   Script tags found: ${scripts.length}`);
    
    for (let i = 0; i < Math.min(scripts.length, 3); i++) {
      const src = await scripts[i].getAttribute('src');
      const type = await scripts[i].getAttribute('type');
      console.log(`   - Script ${i + 1}: src="${src}", type="${type}"`);
    }
    
    console.log('\n5. Network requests for JavaScript:');
    const jsRequests = allEvents.filter(e => e.type === 'request' && e.url?.includes('.js'));
    jsRequests.forEach(req => {
      console.log(`   ${req.status} ${req.url}`);
    });
    
    console.log('\n6. JavaScript responses:');
    const jsResponses = allEvents.filter(e => e.type === 'response' && (e.url?.includes('.js') || e.status >= 400));
    jsResponses.forEach(resp => {
      console.log(`   ${resp.status} ${resp.url}`);
    });
    
    console.log('\n7. All console messages:');
    const consoleMsgs = allEvents.filter(e => e.type === 'console');
    if (consoleMsgs.length === 0) {
      console.log('   (none)');
    } else {
      consoleMsgs.forEach(msg => {
        console.log(`   [${msg.subtype}] ${msg.text.substring(0, 150)}`);
      });
    }
    
    console.log('\n8. Page errors:');
    const pageErrors = allEvents.filter(e => e.type === 'pageerror');
    if (pageErrors.length === 0) {
      console.log('   (none)');
    } else {
      pageErrors.forEach(err => {
        console.log(`   ${err.text.substring(0, 200)}`);
        if (err.stack) {
          console.log(`   Stack: ${err.stack.substring(0, 200)}`);
        }
      });
    }
    
    console.log('\n9. Final DOM state:');
    const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(() => 'NOT FOUND');
    console.log(`   Root HTML: ${rootHtml.substring(0, 100)}...`);
    
    const bodyHtml = await page.$eval('body', el => el.innerHTML).catch(() => 'NOT FOUND');
    console.log(`   Body HTML length: ${bodyHtml.length} characters`);
    
  } catch (error) {
    console.log(`\nError: ${error.message}`);
  }
  
  await browser.close();
  
  console.log('\n=== Debug Complete ===');
})();
