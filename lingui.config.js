import { formatter } from '@lingui/format-po';

export default {
  sourceLocale: 'en',
  locales: ['en', 'zh-HK', 'zh-CN'],
  catalogs: [{ include: ['src'], path: '<rootDir>/src/i18n/locales/{locale}' }],
  format: formatter(),
  runtimeConfigModule: ['./src/i18n/setup', 'i18n'],
};
