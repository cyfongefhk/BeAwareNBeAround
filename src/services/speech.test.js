import { expect, test, vi } from 'vitest';
import { speak } from './speech';

test('cancels active speech and speaks with the selected locale', () => {
  const cancel = vi.fn();
  const speakNative = vi.fn();
  class Utterance {
    constructor(text) {
      this.text = text;
    }
  }

  expect(speak('Stay calm.', 'en-US', { speechSynthesis: { cancel, speak: speakNative }, SpeechSynthesisUtterance: Utterance })).toBe(true);
  expect(cancel).toHaveBeenCalledOnce();
  expect(speakNative).toHaveBeenCalledWith(expect.objectContaining({ text: 'Stay calm.', lang: 'en-US' }));
});

test('returns false when speech synthesis is unavailable', () => {
  expect(speak('Stay calm.', 'en-US', {})).toBe(false);
});
