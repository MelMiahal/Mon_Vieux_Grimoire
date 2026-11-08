import axios from 'axios';
import { addBook } from './common';

jest.mock('axios', () => jest.fn());

test('sends the selected initial rating as a top-level book field', async () => {
  axios.mockResolvedValue({ status: 201 });
  localStorage.setItem('userId', 'creator-id');
  localStorage.setItem('token', 'test-token');

  await addBook({
    title: 'Le livre',
    author: 'Une autrice',
    year: '2026',
    genre: 'Roman',
    rating: '4',
    file: [new File(['cover'], 'cover.png', { type: 'image/png' })],
  });

  const request = axios.mock.calls[0][0];
  const book = JSON.parse(request.data.get('book'));
  expect(book.rating).toBe(4);
  expect(book.ratings).toBeUndefined();
  expect(book.averageRating).toBeUndefined();
  expect(request.headers.Authorization).toBe('Bearer test-token');
});
