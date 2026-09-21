import { expect, test } from '@playwright/test';

test('matches the approved Traditional Chinese mobile layout', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('zh-hk-375.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});
