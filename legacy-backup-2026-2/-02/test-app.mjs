/**
 * Comprehensive Playwright Test for Dominic's Tasks Application
 * Tests all pages for errors and functionality
 */

import { chromium } from 'playwright';

const TEST_URL = 'https://dominicstasks.pages.dev';

async function runTests() {
  console.log('🚀 Starting Dominic\'s Tasks Test...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  const warnings = [];
  
  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[ERROR] ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      warnings.push(`[WARNING] ${msg.text()}`);
    }
  });
  
  // Collect page errors
  page.on('pageerror', error => {
    errors.push(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    // Test 1: Load Login Page
    console.log('📄 Testing Login Page...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Login page loaded');
    
    // Test 2: Navigate to Tasks (after login simulation)
    console.log('\n📄 Testing Tasks Page...');
    await page.goto(`${TEST_URL}/tasks`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Tasks page loaded');
    
    // Test 3: Navigate to Calendar
    console.log('\n📄 Testing Calendar Page...');
    await page.goto(`${TEST_URL}/calendar`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Calendar page loaded');
    
    // Test 4: Navigate to Family Chat
    console.log('\n📄 Testing Family Chat Page...');
    await page.goto(`${TEST_URL}/chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Family Chat page loaded');
    
    // Test 5: Navigate to Parent Chat (should be protected)
    console.log('\n📄 Testing Parent Chat Page...');
    await page.goto(`${TEST_URL}/parent-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Parent Chat page loaded');
    
    // Test 6: Navigate to Resources
    console.log('\n📄 Testing Resources Page...');
    await page.goto(`${TEST_URL}/resources`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Resources page loaded');
    
    // Test 7: Navigate to Achievements
    console.log('\n📄 Testing Achievements Page...');
    await page.goto(`${TEST_URL}/achievements`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Achievements page loaded');
    
    // Test 8: Navigate to History
    console.log('\n📄 Testing History Page...');
    await page.goto(`${TEST_URL}/history`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ History page loaded');
    
  } catch (error) {
    console.error('Navigation error:', error);
    errors.push(`[NAVIGATION ERROR] ${error}`);
  }
  
  await browser.close();
  
  // Report results
  console.log('\n' + '='.repeat(50));
  console.log('🧪 TEST RESULTS');
  console.log('='.repeat(50));
  
  if (errors.length === 0) {
    console.log('✅ No errors found! All pages loaded successfully.');
  } else {
    console.log(`❌ Found ${errors.length} error(s):`);
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️ Found ${warnings.length} warning(s):`);
    warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
  }
  
  console.log('='.repeat(50));
  
  // Exit with error code if there are errors
  process.exit(errors.length > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
