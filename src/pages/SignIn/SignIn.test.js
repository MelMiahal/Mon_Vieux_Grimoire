import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SignIn from './SignIn';

jest.mock('axios', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../lib/customHooks', () => ({
  useUser: () => ({ user: null, authenticated: false }),
}));

function renderSignIn() {
  render(
    <MemoryRouter>
      <SignIn setUser={jest.fn()} />
    </MemoryRouter>,
  );
  return {
    email: screen.getByRole('textbox'),
    password: screen.getByLabelText('Mot de passe'),
  };
}

beforeEach(() => {
  axios.mockReset();
  localStorage.clear();
});

test('clears email and password after successful signup', async () => {
  axios.mockResolvedValueOnce({ data: { message: 'created' } });
  const fields = renderSignIn();

  fireEvent.change(fields.email, { target: { value: 'reader@example.com' } });
  fireEvent.change(fields.password, { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

  await waitFor(() => {
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByLabelText('Mot de passe')).toHaveValue('');
  });
});

test('clears email and password after successful login', async () => {
  axios.mockResolvedValueOnce({ data: { userId: 'reader-id', token: 'valid-token' } });
  const fields = renderSignIn();

  fireEvent.change(fields.email, { target: { value: 'reader@example.com' } });
  fireEvent.change(fields.password, { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

  await waitFor(() => {
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByLabelText('Mot de passe')).toHaveValue('');
  });
});
