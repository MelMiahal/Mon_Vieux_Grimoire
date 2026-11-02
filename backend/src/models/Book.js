const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'A rating must be an integer between 0 and 5',
    },
  },
});

const bookSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
    min: 0,
  },
  genre: {
    type: String,
    required: true,
  },
  ratings: {
    type: [ratingSchema],
    default: [],
  },
  averageRating: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Book', bookSchema);
