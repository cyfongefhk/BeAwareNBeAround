const MIME_TYPES = ['audio/webm', 'audio/mp4', 'audio/ogg'];

export function preferredMimeType(MediaRecorderClass = MediaRecorder) {
  return MIME_TYPES.find((type) => MediaRecorderClass.isTypeSupported(type)) ?? '';
}

export function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}
