import { expect, test } from 'vitest';
import { getInstallAction } from './install';

test('uses manual instructions on iOS', () => {
  expect(getInstallAction({ isIOS: true })).toBe('manual');
});

test('uses the deferred install prompt when it is available', () => {
  expect(getInstallAction({ isIOS: false, prompt: {} })).toBe('prompt');
});

test('uses manual instructions when installation is unsupported', () => {
  expect(getInstallAction({ isIOS: false })).toBe('manual');
});
