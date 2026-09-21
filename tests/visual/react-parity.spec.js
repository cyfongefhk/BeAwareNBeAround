import { expect, test } from '@playwright/test';

test('preserves the approved Traditional Chinese mobile layout', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('zh-hk-375.png', {
    fullPage: true,
    animations: 'disabled',
    mask: [page.locator('iframe')],
    maxDiffPixelRatio: 0.01,
  });
});
