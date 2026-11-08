const test = require('node:test');
const assert = require('node:assert/strict');
const { getBookFields, parseBookPayload } = require('../src/utils/book');

test('parses book data from the multipart form field', () => {
  assert.deepEqual(parseBookPayload({ book: '{"title":"Le livre"}' }), { title: 'Le livre' });
});

test('accepts a JSON book object when no image is uploaded', () => {
  const book = { title: 'Le livre', author: 'Autrice', year: 2026, genre: 'Roman' };
  assert.deepEqual(parseBookPayload(book), book);
});

test('rejects invalid JSON and missing required fields', () => {
  assert.throws(() => parseBookPayload({ book: '{' }), { status: 400 });
  assert.throws(() => getBookFields({ title: 'Le livre' }), { status: 400 });
});

test('normalizes and validates fields used by the Book model', () => {
  assert.deepEqual(getBookFields({
    title: ' Le livre ',
    author: ' Autrice ',
    year: '2026',
    genre: ' Roman ',
  }), {
    title: 'Le livre',
    author: 'Autrice',
    year: 2026,
    genre: 'Roman',
  });

  assert.throws(() => getBookFields({
    title: 'Le livre',
    author: 'Autrice',
    year: '20x6',
    genre: 'Roman',
  }), { status: 400 });
});
