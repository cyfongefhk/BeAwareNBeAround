export function stopSpeech(api = window) {
  api.speechSynthesis?.cancel();
}

export function speak(text, language, api = window) {
  if (!api.speechSynthesis || !api.SpeechSynthesisUtterance) return false;

  api.speechSynthesis.cancel();
  const utterance = new api.SpeechSynthesisUtterance(text);
  utterance.lang = language;
  api.speechSynthesis.speak(utterance);
  return true;
}
