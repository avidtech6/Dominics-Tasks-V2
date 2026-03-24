import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  // Collect console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push(text);
    } else if (type === 'warning') {
      warnings.push(text);
    }
    
    // Check for infinite loop indicators
    if (text.includes('Maximum update depth exceeded') || 
        text.includes('render count') ||
        text.includes('react-hooks/exhaustive-deps')) {
      errors.push(`LOOP DETECTED: ${text}`);
    }
  });
  
  // Collect page errors
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  try {
    // Navigate to the app in dev mode
    await page.goto('http://localhost:5173/?dev=true', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(3000);
    
    // Check if page rendered
    const content = await page.content();
    const hasContent = content.includes('Dominic') || content.includes('Tasks') || content.includes('Loading');
    
    console.log('=== TEST RESULTS ===');
    console.log('Page rendered:', hasContent ? 'YES' : 'NO');
    console.log('Errors found:', errors.length);
    
    if (errors.length > 0) {
      console.log('\\n=== ERRORS ===');
      errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));
    }
    
    if (warnings.length > 0) {
      console.log('\\n=== WARNINGS ===');
      warnings.forEach((w, i) => console.log(`${i + 1}. ${w}`));
    }
    
    // Check for the infinite loop specifically
    const hasLoopError = errors.some(e => e.includes('Maximum update depth exceeded'));
    console.log('\\n=== INFINITE LOOP CHECK ===');
    console.log('Infinite loop detected:', hasLoopError ? 'YES (FAILED)' : 'NO (PASSED)');
    
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
