import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allMessages = [];
  page.on('console', msg => {
    allMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push({ message: err.message, stack: err.stack });
  });

  console.log('=== Testing /tasks route with simulated auth ===\n');

  try {
    // Navigate to /tasks directly (simulating logged in user)
    console.log('1. Navigating directly to /tasks...');
    const response = await page.goto('https://dominicstasks.pages.dev/tasks', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${response.status()}\n`);

    // Wait for potential loading
    await page.waitForTimeout(5000);

    // Check what's displayed
    const bodyContent = await page.evaluate(() => document.body.innerHTML);
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log(`2. Body Content Length: ${bodyContent.length} characters`);
    console.log(`3. Body Text: "${bodyText.substring(0, 200)}..."\n`);

    // Check for loading screen
    const hasLoadingScreen = bodyText.includes('Loading Dominic\'s Tasks');
    const hasTasksContent = bodyText.includes('Tasks') || bodyText.includes('Productive');
    
    console.log(`4. Still on Loading Screen: ${hasLoadingScreen}`);
    console.log(`5. Has Tasks Content: ${hasTasksContent}\n`);

    // Check for React rendering
    const hasRoot = await page.evaluate(() => !!document.getElementById('root'));
    const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'empty');
    console.log(`6. Has #root: ${hasRoot}`);
    console.log(`7. Root content length: ${rootContent.length} characters\n`);

    // Report all console messages
    console.log('8. ALL CONSOLE MESSAGES:');
    allMessages.forEach((msg, i) => {
      console.log(`   [${i + 1}] [${msg.type}] ${msg.text}`);
    });

    if (pageErrors.length > 0) {
      console.log('\n9. PAGE ERRORS:');
      pageErrors.forEach((err, i) => {
        console.log(`   [${i + 1}] ${err.message}`);
      });
    }

    await page.screenshot({ path: '/workspace/dominicstasks/screenshot_tasks.png', fullPage: true });
    console.log('\n=== Screenshot saved to /workspace/dominicstasks/screenshot_tasks.png ===');

  } catch (error) {
    console.log(`ERROR: ${error.message}`);
  }

  await browser.close();
  console.log('\n=== Test Complete ===');
})();
