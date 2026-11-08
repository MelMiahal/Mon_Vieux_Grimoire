import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios', () => jest.fn());
jest.mock('./components/ScrollToTop/ScrollToTop', () => () => null);

beforeEach(() => {
  axios.mockResolvedValue({ data: [] });
});

test('renders the home page and its add-book action', async () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Nos Livres' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '+ Ajouter un livre' })).toHaveAttribute('href', '/Ajouter');
  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: 'Chargement' })).not.toBeInTheDocument();
  });
});
