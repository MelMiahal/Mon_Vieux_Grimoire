const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authorization = req.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const error = new Error('Authentication required');
    error.status = 401;
    return next(error);
  }

  try {
    const token = authorization.slice('Bearer '.length);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload.userId !== 'string' || !payload.userId) {
      const error = new Error('Invalid authentication token');
      error.status = 401;
      return next(error);
    }

    req.auth = { userId: payload.userId };
    return next();
  } catch (error) {
    error.status = 401;
    return next(error);
  }
}

module.exports = authenticate;
