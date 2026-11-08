function parseBookPayload(body) {
  if (typeof body.book === 'string') {
    try {
      return JSON.parse(body.book);
    } catch (error) {
      const invalidPayload = new Error('Book data must be valid JSON');
      invalidPayload.status = 400;
      throw invalidPayload;
    }
  }

  if (body.book && typeof body.book === 'object') {
    return body.book;
  }

  return body;
}

function getBookFields(payload) {
  const year = Number(payload.year);
  const fields = {
    title: typeof payload.title === 'string' ? payload.title.trim() : '',
    author: typeof payload.author === 'string' ? payload.author.trim() : '',
    year,
    genre: typeof payload.genre === 'string' ? payload.genre.trim() : '',
  };

  if (!fields.title || !fields.author || !fields.genre
    || !Number.isInteger(year) || year < 0) {
    const invalidBook = new Error('Title, author, year and genre are required');
    invalidBook.status = 400;
    throw invalidBook;
  }

  return fields;
}

module.exports = {
  getBookFields,
  parseBookPayload,
};
