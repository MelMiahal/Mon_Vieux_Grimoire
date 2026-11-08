const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const bookController = require('../controllers/bookController');

const router = express.Router();

router.get('/bestrating', asyncHandler(bookController.getBestRatedBooks));
router.get('/', asyncHandler(bookController.getAllBooks));
router.get('/:id', asyncHandler(bookController.getBook));
router.post('/', authenticate, upload.single('image'), asyncHandler(bookController.createBook));
router.put('/:id', authenticate, upload.single('image'), asyncHandler(bookController.updateBook));
router.delete('/:id', authenticate, asyncHandler(bookController.deleteBook));
router.post('/:id/rating', authenticate, asyncHandler(bookController.rateBook));

module.exports = router;
