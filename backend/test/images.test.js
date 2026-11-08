const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { deleteImage, saveOptimizedImage } = require('../src/utils/images');

const imageDirectory = path.resolve(__dirname, '../public/images');

test('resizes uploaded images and stores them as WebP', async () => {
  const buffer = await sharp({
    create: {
      width: 1600,
      height: 900,
      channels: 3,
      background: '#336699',
    },
  }).png().toBuffer();

  const saved = await saveOptimizedImage({
    buffer,
    mimetype: 'image/png',
  });

  try {
    assert.match(saved.url, /^http:\/\/localhost:4000\/images\/[\w-]+\.webp$/);
    const metadata = await sharp(await fs.readFile(path.join(imageDirectory, saved.filename))).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 675);
  } finally {
    await deleteImage(saved.url);
  }
});

test('rejects invalid image data', async () => {
  await assert.rejects(
    saveOptimizedImage({ buffer: Buffer.from('not an image') }),
    { status: 400 },
  );
});
