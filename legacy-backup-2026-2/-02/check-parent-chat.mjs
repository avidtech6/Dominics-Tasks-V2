import { chromium } from 'playwright';

async function checkParentChat() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const logs = [];

  // Capture console logs
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    logs.push(`[${type}] ${text}`);
    if (type === 'error') {
      errors.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    errors.push(`Page error: ${error.message}`);
  });

  try {
    console.log('=== Testing Parent Chat Page ===\n');

    // Navigate to the deployed app
    const baseUrl = 'https://f2f6f440.dominicstasks.pages.dev';
    console.log(`Navigating to: ${baseUrl}/parent-chat`);
    
    // First go to login page to get authenticated
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check if already logged in - if so, navigate directly
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/login')) {
      console.log('Already authenticated, navigating to parent-chat...');
    } else {
      // Check if we need to login
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        console.log('Need to login...');
        // Login with parent credentials
        await page.fill('input[type="email"]', 'derrickmg.admin@gmail.com');
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      }
    }

    // Now navigate to parent-chat
    console.log('\nNavigating to Parent Chat...');
    await page.goto(`${baseUrl}/parent-chat`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n--- Page Title & URL ---');
    console.log(`URL: ${page.url()}`);
    console.log(`Title: ${await page.title()}`);

    console.log('\n--- Form Elements Check ---');
    
    // Check for input field
    const inputField = await page.$('input[type="text"]');
    if (inputField) {
      console.log('✓ Input field found');
      const placeholder = await inputField.getAttribute('placeholder');
      console.log(`  Placeholder: "${placeholder}"`);
    } else {
      console.log('✗ No input field found');
    }

    // Check for submit button
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      console.log('✓ Submit button found');
      const buttonText = await submitButton.textContent();
      console.log(`  Button content: "${buttonText?.trim()}"`);
      const isDisabled = await submitButton.isDisabled();
      console.log(`  Button disabled: ${isDisabled}`);
    } else {
      console.log('✗ No submit button found');
    }

    // Check for all buttons
    console.log('\n--- All Buttons ---');
    const allButtons = await page.$$('button');
    console.log(`Found ${allButtons.length} buttons`);
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const type = await allButtons[i].getAttribute('type');
      console.log(`  [${i}] type="${type}", text="${text?.trim().substring(0, 50)}"`);
    }

    // Check for the form
    console.log('\n--- Form Check ---');
    const forms = await page.$$('form');
    console.log(`Found ${forms.length} forms`);
    if (forms.length > 0) {
      const formOnSubmit = await forms[0].getAttribute('onsubmit');
      console.log(`Form onsubmit: ${formOnSubmit?.substring(0, 100)}...`);
    }

    // Check heading
    console.log('\n--- Heading ---');
    const h1 = await page.$('h1');
    if (h1) {
      const h1Text = await h1.textContent();
      console.log(`H1: "${h1Text?.trim()}"`);
    }

    console.log('\n--- Console Logs ---');
    logs.forEach(log => console.log(log));

    console.log('\n--- Errors ---');
    if (errors.length === 0) {
      console.log('No errors detected!');
    } else {
      errors.forEach(err => console.log(`ERROR: ${err}`));
    }

    console.log('\n=== Test Complete ===');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

checkParentChat();
