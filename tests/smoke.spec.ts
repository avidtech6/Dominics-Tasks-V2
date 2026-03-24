import { test, expect } from '@playwright/test';

test.describe('Dominic\'s Tasks Application Smoke Tests', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for page title or heading
    await expect(page).toHaveTitle(/Dominic's Tasks|Loading/);
    
    // Check for sign in button or app content
    const signInButton = page.getByRole('button', { name: /sign in/i });
    const loadingText = page.getByText(/loading/i);
    
    // Either sign in button should be visible or loading text
    await expect(signInButton.or(loadingText)).toBeVisible();
  });

  test('should have working navigation when authenticated', async ({ page }) => {
    // This test would require authentication setup
    // For now, just check that the app structure is present
    await page.goto('/');
    
    // Check for React app container
    const appContainer = page.locator('#root');
    await expect(appContainer).toBeVisible();
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');
    
    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
    
    // Check for charset meta tag
    const charsetMeta = page.locator('meta[charset]');
    await expect(charsetMeta).toHaveAttribute('charset', 'UTF-8');
  });
});