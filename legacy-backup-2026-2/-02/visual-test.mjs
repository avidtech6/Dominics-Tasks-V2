import { chromium } from 'playwright';

(async () => {
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleLogs = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else {
      consoleLogs.push(text);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('📱 Opening https://dominicstasks.pages.dev...');
    await page.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('⏳ Waiting...');
    await page.waitForTimeout(2000);
    
    // Check localStorage and sessionStorage
    const storage = await page.evaluate(() => {
      return {
        localStorage: Object.fromEntries(Object.entries(localStorage)),
        sessionStorage: Object.fromEntries(Object.entries(sessionStorage))
      };
    });
    
    console.log('\n📦 Local Storage:');
    Object.keys(storage.localStorage).forEach(key => {
      const value = storage.localStorage[key];
      console.log(`  ${key}: ${value?.substring(0, 100)}${value?.length > 100 ? '...' : ''}`);
    });
    
    console.log('\n📦 Session Storage:');
    Object.keys(storage.sessionStorage).forEach(key => {
      const value = storage.sessionStorage[key];
      console.log(`  ${key}: ${value?.substring(0, 100)}${value?.length > 100 ? '...' : ''}`);
    });
    
    // Check cookies
    const cookies = await page.context().cookies();
    console.log('\n🍪 Cookies:');
    cookies.forEach(cookie => {
      console.log(`  ${cookie.name}: ${cookie.value?.substring(0, 50)}...`);
    });
    
    // Check if there's a firebase auth token
    const hasFirebaseAuth = storage.localStorage['firebase:authUser'] || storage.sessionStorage['firebase:authUser'];
    console.log(`\n🔐 Has Firebase auth: ${!!hasFirebaseAuth}`);
    
    // Check current page content
    const pageInfo = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        showsLogin: root?.innerHTML.includes('Welcome Back') || root?.innerHTML.includes('Continue with Google'),
        showsTasks: root?.innerHTML.includes('Today\'s Focus') || root?.innerHTML.includes('This Morning'),
        textContent: root?.textContent?.substring(0, 200)
      };
    });
    
    console.log('\n📄 Page state:');
    console.log(`  - Shows login: ${pageInfo.showsLogin}`);
    console.log(`  - Shows tasks: ${pageInfo.showsTasks}`);
    console.log(`  - Text: "${pageInfo.textContent}"`);
    
    // Print relevant logs
    console.log('\n📜 Relevant console logs:');
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('Auth') || log.includes('🔐') || log.includes('user') || log.includes('loading')
    );
    relevantLogs.forEach(log => console.log(`  ${log}`));
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console errors:');
      consoleErrors.forEach(err => console.log(`  ${err}`));
    }
    
    await page.screenshot({ path: '/workspace/dominicstasks/screenshot2.png', fullPage: true });
    console.log('\n📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
