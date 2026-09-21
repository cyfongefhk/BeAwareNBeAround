import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders the application heading', async () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: "Be Aware n' Be Around" })).toBeInTheDocument();
});
