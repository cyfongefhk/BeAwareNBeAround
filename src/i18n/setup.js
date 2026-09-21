import { setupI18n } from '@lingui/core';
import { DEFAULT_LOCALE, APP_LOCALES } from './config';
import { messages as en } from './locales/en.po';
import { messages as zhHK } from './locales/zh-HK.po';
import { messages as zhCN } from './locales/zh-CN.po';

export { APP_LOCALES };

export const i18n = setupI18n();

const catalogs = { en, 'zh-HK': zhHK, 'zh-CN': zhCN };

export function activateLocale(locale) {
  i18n.loadAndActivate({ locale, messages: catalogs[locale] });
}

activateLocale(DEFAULT_LOCALE);
