const test = require('node:test');
const assert = require('node:assert/strict');
const Book = require('../src/models/Book');

test('Book model uses the fields and defaults expected by the project', () => {
  const book = new Book({
    userId: 'owner-id',
    title: 'Le livre',
    author: 'Une autrice',
    imageUrl: 'http://localhost:4000/images/book.webp',
    year: 2026,
    genre: 'Roman',
  });

  assert.equal(Book.modelName, 'Book');
  assert.equal(Book.collection.name, 'books');
  assert.deepEqual(book.ratings, []);
  assert.equal(book.averageRating, 0);
  assert.deepEqual(book.validateSync(), undefined);
});

test('Book model requires the project book fields', () => {
  const error = new Book().validateSync();

  assert.ok(error);
  for (const field of ['userId', 'title', 'author', 'imageUrl', 'year', 'genre']) {
    assert.ok(error.errors[field], `${field} should be required`);
  }
});

test('Book ratings contain a user ID and a numeric grade', () => {
  const book = new Book({
    userId: 'owner-id',
    title: 'Le livre',
    author: 'Une autrice',
    imageUrl: 'http://localhost:4000/images/book.webp',
    year: 2026,
    genre: 'Roman',
    ratings: [{ userId: 'reader-id', grade: 4 }],
  });

  assert.equal(book.ratings[0].userId, 'reader-id');
  assert.equal(book.ratings[0].grade, 4);
  assert.deepEqual(book.validateSync(), undefined);
});
