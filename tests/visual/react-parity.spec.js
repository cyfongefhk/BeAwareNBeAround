import { expect, test } from '@playwright/test';

const languageStates = [
  { selector: '繁體', snapshot: 'zh-hk-375.png' },
  { selector: '简体', snapshot: 'zh-cn-375.png' },
  { selector: 'EN', snapshot: 'en-375.png' },
];

test.describe('localized mobile layouts', () => {
  test.use({ viewport: { width: 375, height: 1200 } });

  for (const language of languageStates) {
    test(`preserves the approved ${language.selector} layout`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: language.selector, exact: true }).click();

      await expect(page).toHaveScreenshot(language.snapshot, {
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('iframe')],
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
