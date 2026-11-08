const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const Book = require('../src/models/Book');
const app = require('../src/app');

test('POST /api/books/:id/rating saves the authenticated user rating and average', async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'book-rating-test-secret';
  t.after(() => {
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  });

  const originalFindById = Book.findById;
  const book = {
    _id: 'book-id',
    ratings: [],
    averageRating: 0,
    async save() {},
  };
  Book.findById = async () => book;

  const server = app.listen(0);
  t.after(() => {
    Book.findById = originalFindById;
    server.close();
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const url = `http://127.0.0.1:${server.address().port}/api/books/book-id/rating`;
  const unauthorized = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 4 }),
  });
  assert.equal(unauthorized.status, 401);

  const token = jwt.sign({ userId: 'authenticated-user' }, process.env.JWT_SECRET);
  const invalid = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating: 6 }),
  });
  assert.equal(invalid.status, 400);

  const rated = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: 'forged-user', rating: 4 }),
  });
  assert.equal(rated.status, 200);
  const result = await rated.json();
  assert.equal(result.averageRating, 4);
  assert.deepEqual(result.ratings, [{ userId: 'authenticated-user', grade: 4 }]);

  const duplicate = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating: 5 }),
  });
  assert.equal(duplicate.status, 400);
  assert.equal(book.averageRating, 4);
});
