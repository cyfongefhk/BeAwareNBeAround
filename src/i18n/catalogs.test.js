import { expect, test } from 'vitest';
import { APP_LOCALES } from './setup';
import { loadCompiledCatalogs } from './catalogs';

const REQUIRED_LOCALES = ['en', 'zh-HK', 'zh-CN'];

test('configures exactly the supported application locales', () => {
  expect(Object.keys(APP_LOCALES).sort()).toEqual([...REQUIRED_LOCALES].sort());
});

test('compiled catalogs define every extracted message with a non-empty value', () => {
  const catalogs = loadCompiledCatalogs();
  const extractedIds = Object.keys(catalogs.en);

  expect(extractedIds, 'English catalog must expose extracted message IDs').not.toHaveLength(0);

  for (const locale of REQUIRED_LOCALES) {
    const missingIds = extractedIds.filter((id) => !(id in catalogs[locale]));
    const emptyIds = extractedIds.filter((id) => !String(catalogs[locale][id] ?? '').trim());

    expect(
      { missingIds, emptyIds },
      `${locale} catalog is incomplete: missing [${missingIds.join(', ')}]; empty [${emptyIds.join(', ')}]`,
    ).toEqual({ missingIds: [], emptyIds: [] });
  }
});
