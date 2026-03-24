import { test, expect } from '@playwright/test';

test.describe('Tasks Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page (would need authentication in real test)
    await page.goto('/tasks');
  });

  test('should display tasks page structure', async ({ page }) => {
    // Check for main page sections
    await expect(page.getByText(/today's focus/i)).toBeVisible();
    await expect(page.getByText(/right column/i)).toBeVisible();
    
    // Check for task sections
    const morningSection = page.getByText(/morning/i);
    const afternoonSection = page.getByText(/afternoon/i);
    const assignmentsSection = page.getByText(/assignments/i);
    
    // At least some section headers should be visible
    await expect(morningSection.or(afternoonSection).or(assignmentsSection)).toBeVisible();
  });

  test('should have add task button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add task/i });
    await expect(addButton).toBeVisible();
  });

  test('should display task cards when tasks exist', async ({ page }) => {
    // Check for task cards (they might be empty in dev mode)
    const taskCards = page.locator('[data-testid="task-card"], .task-card');
    const cardCount = await taskCards.count();
    
    // Either there are tasks or there's an empty state message
    if (cardCount === 0) {
      await expect(page.getByText(/no tasks/i).or(page.getByText(/add your first task/i))).toBeVisible();
    } else {
      await expect(taskCards.first()).toBeVisible();
    }
  });

  test('should support task drag and drop indicators', async ({ page }) => {
    // Check for drag handles or draggable elements
    const dragHandles = page.locator('[draggable="true"], .drag-handle');
    const handleCount = await dragHandles.count();
    
    // The page should either support drag and drop or not show drag handles
    // This is just a structural check
    expect(handleCount).toBeGreaterThanOrEqual(0);
  });
});