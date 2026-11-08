import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../lib/customHooks';
import SignIn from './SignIn';

jest.mock('axios', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../lib/customHooks', () => ({
  useUser: jest.fn(() => ({ connectedUser: null, auth: false, userLoading: false })),
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

function CurrentPath() {
  const { pathname } = useLocation();
  return <span>{pathname}</span>;
}

beforeEach(() => {
  axios.mockReset();
  useUser.mockReturnValue({ connectedUser: null, auth: false, userLoading: false });
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

test('redirects an authenticated user away from the sign-in page', async () => {
  useUser.mockReturnValue({
    connectedUser: { userId: 'reader-id' },
    auth: true,
    userLoading: false,
  });

  render(
    <MemoryRouter initialEntries={['/Connexion']}>
      <SignIn setUser={jest.fn()} />
      <CurrentPath />
    </MemoryRouter>,
  );

  await waitFor(() => expect(screen.getByText('/')).toBeInTheDocument());
});
