export function isIOS(userAgent = navigator.userAgent) {
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
}

export function getInstallAction({ isIOS: runningOnIOS, prompt }) {
  return runningOnIOS || !prompt ? 'manual' : 'prompt';
}
