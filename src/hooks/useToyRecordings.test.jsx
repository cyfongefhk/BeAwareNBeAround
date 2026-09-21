import { renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useToyRecordings } from './useToyRecordings';

test('cleans up microphone tracks when unmounted', () => {
  const stop = vi.fn();
  const { result, unmount } = renderHook(() => useToyRecordings());
  result.current.setStream({ getTracks: () => [{ stop }] });

  unmount();

  expect(stop).toHaveBeenCalledOnce();
});
