import { beforeEach, expect, test, vi } from 'vitest';
import { incrementCounter, readCounter } from './clickCounter';

beforeEach(() => localStorage.clear());

test('uses the legacy starting count when storage is empty', () => {
  expect(readCounter()).toBe(12543);
});

test('increments and persists the local counter', () => {
  expect(incrementCounter(12543)).toBe(12544);
  expect(localStorage.getItem('efhk_global_clicks')).toBe('12544');
});

test('falls back to the starting count for invalid storage', () => {
  localStorage.setItem('efhk_global_clicks', 'not-a-number');
  expect(readCounter()).toBe(12543);
});
