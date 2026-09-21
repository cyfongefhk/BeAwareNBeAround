import { expect, test, vi } from 'vitest';
import { preferredMimeType, stopStream } from './recording';

test('selects the first supported recording format', () => {
  const Recorder = { isTypeSupported: (type) => type === 'audio/mp4' };
  expect(preferredMimeType(Recorder)).toBe('audio/mp4');
});

test('stops every microphone track', () => {
  const stop = vi.fn();
  stopStream({ getTracks: () => [{ stop }, { stop }] });
  expect(stop).toHaveBeenCalledTimes(2);
});
