import { expect, test } from 'vitest';
import { APP_LOCALES, activateLocale, i18n } from './setup';

test('starts in Traditional Chinese', () => {
  expect(i18n.locale).toBe('zh-HK');
});

test('maps selector locales to speech locales', () => {
  expect(APP_LOCALES['zh-HK'].speechLocale).toBe('zh-HK');
  expect(APP_LOCALES['zh-CN'].speechLocale).toBe('zh-CN');
  expect(APP_LOCALES.en.speechLocale).toBe('en-US');
});

test('activates a supported local catalog', () => {
  activateLocale('en');

  expect(i18n.locale).toBe('en');
});
