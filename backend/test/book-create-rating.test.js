const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const Book = require('../src/models/Book');
const { deleteImage } = require('../src/utils/images');
const app = require('../src/app');

test('POST /api/books initializes the average from the authenticated creator rating', async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'book-create-rating-test-secret';
  t.after(() => {
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  });

  const originalSave = Book.prototype.save;
  const savedBooks = [];
  Book.prototype.save = async function saveBook() {
    savedBooks.push(this.toObject());
    return this;
  };
  const imageUrls = [];

  const server = app.listen(0);
  t.after(async () => {
    Book.prototype.save = originalSave;
    await new Promise((resolve) => server.close(resolve));
    await Promise.all(imageUrls.map((url) => deleteImage(url)));
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const token = jwt.sign({ userId: 'authenticated-creator' }, process.env.JWT_SECRET);
  const imageBuffer = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 3,
      background: '#336699',
    },
  }).png().toBuffer();
  const url = `http://127.0.0.1:${server.address().port}/api/books`;

  async function createBook(bookData) {
    const form = new FormData();
    form.append('book', JSON.stringify(bookData));
    form.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'cover.png');
    return fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  }

  const ratedResponse = await createBook({
    userId: 'forged-user',
    title: 'Livre noté',
    author: 'Autrice',
    year: 2026,
    genre: 'Roman',
    rating: 4,
    ratings: [{ userId: 'forged-user', grade: 1 }],
    averageRating: 1,
  });
  assert.equal(ratedResponse.status, 201);
  imageUrls.push(savedBooks[0].imageUrl);
  assert.equal(savedBooks[0].userId, 'authenticated-creator');
  assert.deepEqual(savedBooks[0].ratings.map(({ userId, grade }) => ({ userId, grade })), [
    { userId: 'authenticated-creator', grade: 4 },
  ]);
  assert.equal(savedBooks[0].averageRating, 4);

  const unratedResponse = await createBook({
    title: 'Livre sans note',
    author: 'Autrice',
    year: 2026,
    genre: 'Roman',
  });
  assert.equal(unratedResponse.status, 201);
  imageUrls.push(savedBooks[1].imageUrl);
  assert.deepEqual(savedBooks[1].ratings, []);
  assert.equal(savedBooks[1].averageRating, 0);
});
