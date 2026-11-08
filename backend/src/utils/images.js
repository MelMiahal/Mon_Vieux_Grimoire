const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const imageDirectory = path.resolve(__dirname, '../../public/images');

async function saveOptimizedImage(file) {
  if (!file) {
    return null;
  }

  let optimizedImage;
  try {
    optimizedImage = await sharp(file.buffer, {
      failOn: 'error',
      limitInputPixels: 40000000,
    })
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (cause) {
    const invalidImage = new Error('The uploaded file is not a valid image');
    invalidImage.status = 400;
    invalidImage.cause = cause;
    throw invalidImage;
  }

  await fs.mkdir(imageDirectory, { recursive: true });
  const filename = `${crypto.randomUUID()}.webp`;
  await fs.writeFile(path.join(imageDirectory, filename), optimizedImage, { flag: 'wx' });

  const baseUrl = (process.env.PUBLIC_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
  return {
    filename,
    url: `${baseUrl}/images/${filename}`,
  };
}

async function deleteImage(imageUrl) {
  if (!imageUrl) {
    return;
  }

  let filename;
  try {
    const url = new URL(imageUrl);
    const baseUrl = new URL(process.env.PUBLIC_BASE_URL || 'http://localhost:4000');
    if (url.origin !== baseUrl.origin || !url.pathname.startsWith('/images/')) {
      return;
    }
    filename = path.basename(url.pathname);
  } catch (error) {
    return;
  }

  if (!/^[\w-]+\.webp$/.test(filename)) {
    return;
  }

  try {
    await fs.unlink(path.join(imageDirectory, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  deleteImage,
  saveOptimizedImage,
};
