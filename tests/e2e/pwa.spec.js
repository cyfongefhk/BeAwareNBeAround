import { expect, test } from '@playwright/test';

test('serves the generated manifest and service worker', async ({ page, request }) => {
  await page.goto('/');

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBeTruthy();

  const manifest = await request.get(manifestHref);
  expect(manifest.ok()).toBeTruthy();
  expect(await manifest.json()).toMatchObject({
    name: "香港腦癇基金會 - 守望相助 (EFHK Be Aware n' Be Around)",
    display: 'standalone',
  });

  const serviceWorker = await request.get('/sw.js');
  expect(serviceWorker.ok()).toBeTruthy();
});
