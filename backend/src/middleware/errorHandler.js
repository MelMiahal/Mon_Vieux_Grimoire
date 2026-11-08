function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let status = error.status || error.statusCode || 500;
  if (error.name === 'ValidationError' || error.name === 'CastError'
    || error.name === 'MulterError' || error.code === 11000) {
    status = 400;
  }

  console.error(error);
  return res.status(status).json({ error: error.message });
}

module.exports = errorHandler;
