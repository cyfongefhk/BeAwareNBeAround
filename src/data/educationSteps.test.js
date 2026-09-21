import { expect, test } from 'vitest';
import { educationSteps, languages } from './educationSteps';

test('defines four education steps for each supported language', () => {
  for (const language of Object.keys(languages)) {
    expect(Object.keys(educationSteps[language])).toEqual(['1', '2', '3', '4']);
  }
});
