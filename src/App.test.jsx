import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { I18nProvider } from '@lingui/react';
import App from './App';
import { activateLocale, i18n } from './i18n/setup';

vi.mock('./hooks/useToyRecordings', () => ({
  useToyRecordings: () => ({
    cleanup: vi.fn(),
    enable: vi.fn().mockResolvedValue(true),
    play: vi.fn().mockReturnValue(false),
    record: vi.fn().mockReturnValue('started'),
    recordingId: null,
  }),
}));

function renderApp(locale = 'zh-HK') {
  activateLocale(locale);
  return render(<I18nProvider i18n={i18n}><App /></I18nProvider>);
}

test('renders the application heading', async () => {
  renderApp();

  expect(screen.getByRole('heading', { name: "Be Aware n' Be Around" })).toBeInTheDocument();
});

test('switches the visible action labels to English', () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: 'EN' }));

  expect(screen.getByRole('button', { name: 'STAY' })).toBeInTheDocument();
  expect(screen.getByText('Global Clicks:')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '🔗 Learn more about Epilepsy Foundation HK' })).toBeInTheDocument();
});

test('renders the Traditional Chinese education status with its action identifier', () => {
  const speak = vi.spyOn(window.speechSynthesis, 'speak').mockImplementation(() => {});
  vi.spyOn(window.speechSynthesis, 'cancel').mockImplementation(() => {});
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: '守' }));

  expect(screen.getByText('12,544')).toBeInTheDocument();
  expect(speak).toHaveBeenCalledOnce();
  expect(screen.getByText('播放教育步驟 1...')).toBeInTheDocument();
});

test('renders the English education status with its action identifier', () => {
  vi.spyOn(window.speechSynthesis, 'speak').mockImplementation(() => {});
  vi.spyOn(window.speechSynthesis, 'cancel').mockImplementation(() => {});
  renderApp('en');

  fireEvent.click(screen.getByRole('button', { name: 'STAY' }));

  expect(screen.getByText('Playing education step 1...')).toBeInTheDocument();
});

test('renders the translated recording status with its action identifier', async () => {
  renderApp('en');

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'toy' } });
  fireEvent.click(screen.getByRole('button', { name: 'Record Mode: OFF' }));
  await screen.findByRole('button', { name: 'Record Mode: ON (Click a button)' });
  fireEvent.click(screen.getByRole('button', { name: 'STAY' }));

  expect(await screen.findByText('Recording on button 1... (Max 60s)')).toBeInTheDocument();
});
