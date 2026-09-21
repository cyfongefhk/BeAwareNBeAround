import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';

test('renders the application heading', async () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: "Be Aware n' Be Around" })).toBeInTheDocument();
});

test('switches the visible action labels to English', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'EN' }));

  expect(screen.getByRole('button', { name: 'STAY' })).toBeInTheDocument();
  expect(screen.getByText('Global Clicks:')).toBeInTheDocument();
});

test('increments the counter and speaks an education action', () => {
  const speak = vi.spyOn(window.speechSynthesis, 'speak').mockImplementation(() => {});
  vi.spyOn(window.speechSynthesis, 'cancel').mockImplementation(() => {});
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: '守' }));

  expect(screen.getByText('12,544')).toBeInTheDocument();
  expect(speak).toHaveBeenCalledOnce();
});
