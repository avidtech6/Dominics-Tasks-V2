import { chromium } from 'playwright';

async function checkChatComponents() {
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
    console.log('=== Testing Chat Components ===\n');

    const baseUrl = 'https://f2f6f440.dominicstasks.pages.dev';

    // Go to login page
    console.log('1. Navigating to login page...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check what's on the login page
    console.log('\n--- Login Page Check ---');
    const loginUrl = page.url();
    console.log(`URL: ${loginUrl}`);

    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (emailInput && passwordInput) {
      console.log('✓ Login form found');
      
      // Try to login
      console.log('Attempting login...');
      await page.fill('input[type="email"]', 'derrickmg.admin@gmail.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForTimeout(5000);
      
      console.log(`After login URL: ${page.url()}`);
    } else {
      console.log('✗ Login form NOT found');
      console.log('Checking what buttons are present...');
      const buttons = await page.$$('button');
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        console.log(`  Button: "${text?.trim()}"`);
      }
    }

    // Check current auth state
    console.log('\n--- Auth State Check ---');
    const userDisplayName = await page.evaluate(() => {
      // Check if there's any user info displayed
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent?.includes('derrickmg.admin')) {
          return 'Found user reference in DOM';
        }
      }
      return 'No user reference found';
    });
    console.log(userDisplayName);

    // Now test Family Chat (which user says works)
    console.log('\n=== Testing Family Chat ===');
    await page.goto(`${baseUrl}/family-chat`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log(`Family Chat URL: ${page.url()}`);
    console.log(`Family Chat Title: ${await page.title()}`);

    const fcInput = await page.$('input[type="text"]');
    const fcButton = await page.$('button[type="submit"]');
    console.log(`Family Chat - Input: ${fcInput ? '✓ Found' : '✗ Not found'}`);
    console.log(`Family Chat - Submit: ${fcButton ? '✓ Found' : '✗ Not found'}`);

    // Now test Parent Chat
    console.log('\n=== Testing Parent Chat ===');
    await page.goto(`${baseUrl}/parent-chat`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log(`Parent Chat URL: ${page.url()}`);
    console.log(`Parent Chat Title: ${await page.title()}`);

    const pcInput = await page.$('input[type="text"]');
    const pcButton = await page.$('button[type="submit"]');
    console.log(`Parent Chat - Input: ${pcInput ? '✓ Found' : '✗ Not found'}`);
    console.log(`Parent Chat - Submit: ${pcButton ? '✓ Found' : '✗ Not found'}`);

    // Check heading
    const h1 = await page.$('h1');
    if (h1) {
      const h1Text = await h1.textContent();
      console.log(`H1: "${h1Text?.trim()}"`);
    }

    // Get full page HTML for debugging
    const pageContent = await page.content();
    const hasChatContainer = pageContent.includes('flex flex-col') && pageContent.includes('rounded-2xl');
    console.log(`Has chat container structure: ${hasChatContainer ? '✓ Yes' : '✗ No'}`);

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

checkChatComponents();
