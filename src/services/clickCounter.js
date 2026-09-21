const STORAGE_KEY = 'efhk_global_clicks';
const STARTING_COUNT = 12543;

export function readCounter(storage = localStorage) {
  const value = Number.parseInt(storage.getItem(STORAGE_KEY), 10);
  return Number.isFinite(value) ? value : STARTING_COUNT;
}

export function incrementCounter(currentCount, storage = localStorage) {
  const nextCount = currentCount + 1;
  storage.setItem(STORAGE_KEY, String(nextCount));
  return nextCount;
}
