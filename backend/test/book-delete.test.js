const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const Book = require('../src/models/Book');
const { deleteImage, saveOptimizedImage } = require('../src/utils/images');
const app = require('../src/app');

test('DELETE /api/books/:id requires the owner and removes the book cover', async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'book-delete-test-secret';
  t.after(() => {
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  });

  const originalFindById = Book.findById;
  let deleteCount = 0;
  const cover = await saveOptimizedImage({
    buffer: await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: '#336699',
      },
    }).png().toBuffer(),
    mimetype: 'image/png',
  });
  t.after(() => deleteImage(cover.url));
  const book = {
    userId: 'owner-id',
    imageUrl: cover.url,
    async deleteOne() {
      deleteCount += 1;
    },
  };
  Book.findById = async () => book;

  const server = app.listen(0);
  t.after(() => {
    Book.findById = originalFindById;
    server.close();
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const url = `http://127.0.0.1:${server.address().port}/api/books/book-id`;
  const unauthorized = await fetch(url, { method: 'DELETE' });
  assert.equal(unauthorized.status, 401);
  assert.equal(deleteCount, 0);

  const otherUserToken = jwt.sign({ userId: 'other-user-id' }, process.env.JWT_SECRET);
  const forbidden = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert.equal(forbidden.status, 403);
  assert.equal(deleteCount, 0);

  const ownerToken = jwt.sign({ userId: 'owner-id' }, process.env.JWT_SECRET);
  const deleted = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(deleted.status, 200);
  assert.deepEqual(await deleted.json(), { message: 'Book deleted' });
  assert.equal(deleteCount, 1);
  await assert.rejects(
    fs.access(path.join(__dirname, '../public/images', path.basename(new URL(cover.url).pathname))),
    { code: 'ENOENT' },
  );
});
