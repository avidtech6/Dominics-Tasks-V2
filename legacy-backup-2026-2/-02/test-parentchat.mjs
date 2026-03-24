import { chromium } from 'playwright';

async function checkParentChat() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const logs = [];

  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`ERROR: ${msg.text()}`);
    } else {
      logs.push(`${msg.type().toUpperCase()}: ${msg.text()}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('=== Testing Parent Chat Page ===\n');

    // Navigate to the page
    console.log('Navigating to /parent-chat...');
    await page.goto('https://dominicstasks.pages.dev/parent-chat', { waitUntil: 'networkidle' });

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check if main content loaded
    const bodyContent = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
    console.log(`\nPage HTML (first 500 chars):\n${bodyContent}`);

    // Look for specific elements
    const hasInput = await page.$('input') !== null;
    const hasTextarea = await page.$('textarea') !== null;
    const hasButton = await page.$('button') !== null;

    console.log(`\n=== Element Check ===`);
    console.log(`Input fields: ${hasInput}`);
    console.log(`Textareas: ${hasTextarea}`);
    console.log(`Buttons: ${hasButton}`);

    // Try to find chat-related elements
    const chatMessages = await page.$$('[class*="message"], [class*="chat"], [class*="bubble"]');
    console.log(`Chat-related elements found: ${chatMessages.length}`);

    // Print all errors
    console.log(`\n=== Console Errors (${errors.length}) ===`);
    if (errors.length === 0) {
      console.log('No errors detected!');
    } else {
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }

    // Print all logs
    console.log(`\n=== Console Logs (${logs.length}) ===`);
    logs.forEach((log, i) => console.log(`${i + 1}. ${log}`));

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

checkParentChat();
