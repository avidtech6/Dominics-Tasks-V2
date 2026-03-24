import { chromium } from 'playwright';

async function testSites() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    docs: { status: null, errors: [] },
    main: { status: null, errors: [] }
  };
  
  // Test Documentation Site
  console.log('Testing Documentation Site...');
  try {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.docs.errors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      results.docs.errors.push(err.message);
    });
    
    await page.goto('https://dominicstasks-docs.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    results.docs.status = 'success';
    
    const title = await page.title();
    console.log(`  ✓ Docs site loaded - Title: "${title}"`);
    
  } catch (error) {
    results.docs.status = 'failed';
    results.docs.errors.push(error.message);
    console.log(`  ✗ Docs site failed: ${error.message}`);
  }
  
  // Test Main App
  console.log('\nTesting Main App...');
  const mainPage = await context.newPage();
  
  try {
    mainPage.on('console', msg => {
      if (msg.type() === 'error') {
        results.main.errors.push(msg.text());
      }
    });
    
    mainPage.on('pageerror', err => {
      results.main.errors.push(err.message);
    });
    
    await mainPage.goto('https://dominicstasks.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
    results.main.status = 'success';
    
    const title = await mainPage.title();
    console.log(`  ✓ Main app loaded - Title: "${title}"`);
    
  } catch (error) {
    results.main.status = 'failed';
    results.main.errors.push(error.message);
    console.log(`  ✗ Main app failed: ${error.message}`);
  }
  
  // Report results
  console.log('\n=== Test Results ===');
  
  console.log('\nDocumentation Site:');
  console.log(`  Status: ${results.docs.status}`);
  console.log(`  Console Errors: ${results.docs.errors.length}`);
  if (results.docs.errors.length > 0) {
    results.docs.errors.forEach(err => console.log(`    - ${err}`));
  }
  
  console.log('\nMain App:');
  console.log(`  Status: ${results.main.status}`);
  console.log(`  Console Errors: ${results.main.errors.length}`);
  if (results.main.errors.length > 0) {
    results.main.errors.forEach(err => console.log(`    - ${err}`));
  }
  
  await browser.close();
  
  // Return overall success
  return results.docs.status === 'success' && results.main.status === 'success';
}

testSites().then(success => {
  console.log(`\n${success ? '✓ All tests passed!' : '✗ Some tests failed'}`);
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
