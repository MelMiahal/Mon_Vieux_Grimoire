import React from 'react';
import {
  fireEvent, render, screen,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

test('renders logout as a clickable button and clears the session', () => {
  const setUser = jest.fn();
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('userId', 'reader-id');

  render(
    <MemoryRouter>
      <Header user={{ userId: 'reader-id', token: 'test-token' }} setUser={setUser} />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));

  expect(setUser).toHaveBeenCalledWith(null);
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('userId')).toBeNull();
});
