const Book = require('../models/Book');
const { getBookFields, parseBookPayload } = require('../utils/book');
const { deleteImage, saveOptimizedImage } = require('../utils/images');

async function getAllBooks(req, res) {
  const books = await Book.find();
  return res.status(200).json(books);
}

async function getBook(req, res) {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  return res.status(200).json(book);
}

async function getBestRatedBooks(req, res) {
  const books = await Book.find().sort({ averageRating: -1 }).limit(3);
  return res.status(200).json(books);
}

async function createBook(req, res) {
  if (!req.file) {
    const missingImage = new Error('A book cover image is required');
    missingImage.status = 400;
    throw missingImage;
  }

  const payload = parseBookPayload(req.body);
  const fields = getBookFields(payload);
  const rating = payload.rating === undefined ? 0 : Number(payload.rating);
  if (payload.rating !== undefined
    && ((typeof payload.rating !== 'number' && typeof payload.rating !== 'string')
      || !Number.isInteger(rating) || rating < 0 || rating > 5)) {
    const invalidRating = new Error('Rating must be an integer between 0 and 5');
    invalidRating.status = 400;
    throw invalidRating;
  }
  const image = await saveOptimizedImage(req.file);

  try {
    const book = new Book({
      ...fields,
      userId: req.auth.userId,
      imageUrl: image.url,
      ratings: rating > 0 ? [{ userId: req.auth.userId, grade: rating }] : [],
      averageRating: rating,
    });
    await book.save();
    return res.status(201).json({ message: 'Book created' });
  } catch (error) {
    await deleteImage(image.url);
    throw error;
  }
}

async function updateBook(req, res) {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  if (book.userId !== req.auth.userId) {
    const forbidden = new Error('Forbidden: only the owner can modify this book');
    forbidden.status = 403;
    throw forbidden;
  }

  const fields = getBookFields(parseBookPayload(req.body));
  const image = await saveOptimizedImage(req.file);
  const previousImageUrl = book.imageUrl;
  Object.assign(book, fields);
  if (image) {
    book.imageUrl = image.url;
  }

  try {
    await book.save();
  } catch (error) {
    if (image) {
      await deleteImage(image.url);
    }
    throw error;
  }

  if (image) {
    await deleteImage(previousImageUrl);
  }
  return res.status(200).json({ message: 'Book updated' });
}

async function rateBook(req, res) {
  const { rating } = req.body;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const invalidRating = new Error('Rating must be an integer between 1 and 5');
    invalidRating.status = 400;
    throw invalidRating;
  }

  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  if (book.ratings.some((entry) => entry.userId === req.auth.userId)) {
    const duplicateRating = new Error('A user can rate a book only once');
    duplicateRating.status = 400;
    throw duplicateRating;
  }

  book.ratings.push({ userId: req.auth.userId, grade: rating });
  const sum = book.ratings.reduce((total, entry) => total + entry.grade, 0);
  book.averageRating = Math.round((sum / book.ratings.length) * 10) / 10;
  await book.save();
  return res.status(200).json(book);
}

async function deleteBook(req, res) {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  if (book.userId !== req.auth.userId) {
    const forbidden = new Error('Forbidden: only the owner can delete this book');
    forbidden.status = 403;
    throw forbidden;
  }

  await book.deleteOne();
  try {
    await deleteImage(book.imageUrl);
  } catch (error) {
    console.error('Book was deleted, but its cover could not be removed.', error);
  }
  return res.status(200).json({ message: 'Book deleted' });
}

module.exports = {
  createBook,
  deleteBook,
  getAllBooks,
  getBestRatedBooks,
  getBook,
  rateBook,
  updateBook,
};
