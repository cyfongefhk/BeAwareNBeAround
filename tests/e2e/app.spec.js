import { expect, test } from '@playwright/test';

test('switches language and opens the toy controls', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('button', { name: 'STAY' })).toBeVisible();

  await page.locator('#modeSelect').selectOption('toy');
  await expect(page.getByRole('button', { name: 'Record Mode: OFF' })).toBeVisible();
});

test('includes generated PWA assets', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest/);
  await expect(page.getByRole('heading', { name: "Be Aware n' Be Around" })).toBeVisible();
});
