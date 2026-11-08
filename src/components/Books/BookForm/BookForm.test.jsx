import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookForm from './BookForm';
import { addBook } from '../../../lib/common';

jest.mock('../../../lib/common', () => ({
  addBook: jest.fn(),
  updateBook: jest.fn(),
}));

jest.mock('../../../lib/customHooks', () => ({
  useFilePreview: () => [null],
}));

test('submits the selected initial rating when creating a book', async () => {
  addBook.mockResolvedValue({ data: { message: 'Book created' } });
  const validate = jest.fn();
  render(
    <MemoryRouter>
      <BookForm validate={validate} />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByLabelText('Titre du livre'), { target: { value: 'Le livre' } });
  fireEvent.change(screen.getByLabelText('Auteur'), { target: { value: 'Une autrice' } });
  fireEvent.change(screen.getByLabelText('Année de publication'), { target: { value: '2026' } });
  fireEvent.change(screen.getByLabelText('Genre'), { target: { value: 'Roman' } });

  const rating = document.querySelector('input[name="rating"][value="4"]');
  fireEvent.click(rating);
  expect(rating.checked).toBe(true);

  const image = new File(['cover'], 'cover.png', { type: 'image/png' });
  fireEvent.change(document.querySelector('input[type="file"]'), {
    target: { files: [image] },
  });
  fireEvent.submit(screen.getByRole('button', { name: 'Publier' }).closest('form'));

  await waitFor(() => expect(addBook).toHaveBeenCalled());
  expect(addBook.mock.calls[0][0].rating).toBe('4');
  expect(validate).toHaveBeenCalledWith(true);
});
