import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect ALL console messages
  const allConsoleMessages = [];

  page.on('console', msg => {
    allConsoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push({
      message: err.message,
      stack: err.stack
    });
  });

  console.log('=== Detailed Testing: https://dominicstasks.pages.dev ===\n');

  try {
    // Navigate to the page
    console.log('1. Loading page...');
    const response = await page.goto('https://dominicstasks.pages.dev', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   Status: ${response.status()} ${response.statusText()}`);
    console.log(`   URL: ${response.url()}\n`);

    // Wait for React to initialize
    await page.waitForTimeout(3000);

    // Check page title
    const title = await page.title();
    console.log(`2. Page Title: "${title}"\n`);

    // Check if body has content
    const bodyContent = await page.evaluate(() => document.body.innerHTML);
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log(`3. Body Content Length: ${bodyContent.length} characters`);
    console.log(`4. Body Text Length: ${bodyText.length} characters`);
    console.log(`5. Body Text Preview: "${bodyText.substring(0, 300)}..."\n`);

    // Check for main elements
    const hasAppRoot = await page.evaluate(() => !!document.getElementById('root'));
    const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'empty');
    const hasErrorDiv = await page.evaluate(() => !!document.querySelector('div[style*="padding: 40px"]'));
    
    console.log(`6. Has #root element: ${hasAppRoot}`);
    console.log(`7. Root content preview: "${rootContent.substring(0, 200)}..."`);
    console.log(`8. Has ErrorBoundary UI: ${hasErrorDiv}\n`);

    // Report all console messages
    console.log('9. ALL CONSOLE MESSAGES:');
    allConsoleMessages.forEach((msg, i) => {
      console.log(`   [${i + 1}] [${msg.type}] ${msg.text}`);
    });

    // Report page errors
    if (pageErrors.length > 0) {
      console.log('\n10. PAGE ERRORS:');
      pageErrors.forEach((err, i) => {
        console.log(`   [${i + 1}] Message: ${err.message}`);
        if (err.stack) {
          console.log(`       Stack: ${err.stack.substring(0, 300)}...`);
        }
      });
    } else {
      console.log('\n10. Page Errors: None');
    }

    // Check for specific React initialization messages
    const reactInit = allConsoleMessages.filter(m => m.text.includes('[main.tsx]'));
    if (reactInit.length > 0) {
      console.log('\n11. React Initialization Messages:');
      reactInit.forEach((msg, i) => {
        console.log(`   [${i + 1}] ${msg.text}`);
      });
    }

    // Check for Firebase related messages
    const firebaseMsgs = allConsoleMessages.filter(m => 
      m.text.includes('[Auth]') || 
      m.text.includes('firebase')
    );
    if (firebaseMsgs.length > 0) {
      console.log('\n12. Firebase/Auth Messages:');
      firebaseMsgs.forEach((msg, i) => {
        console.log(`   [${i + 1}] [${msg.type}] ${msg.text}`);
      });
    }

    // Take a detailed screenshot
    await page.screenshot({ path: '/workspace/dominicstasks/screenshot_detailed.png', fullPage: true });
    console.log('\n=== Screenshot saved to: /workspace/dominicstasks/screenshot_detailed.png ===');

  } catch (error) {
    console.log(`ERROR: ${error.message}`);
  }

  await browser.close();
  console.log('\n=== Test Complete ===');
})();
