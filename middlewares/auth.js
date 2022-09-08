const jwt = require('jsonwebtoken');
const errorMiddleware = require('./errorMiddleware');

const BAD_METHOD = 401;

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new errorMiddleware('Bad credentials', BAD_METHOD);
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-testing');
  } catch (err) {
    throw new errorMiddleware('Bad credentials', BAD_METHOD);
  }

  req.user = payload;
  next();
};
