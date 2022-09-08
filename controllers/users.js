/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const errorMiddleware = require('../middlewares/errorMiddleware');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  const OK = 200;
  const BAD_REQUEST = 400;
  const BAD_METHOD = 401;
  const NOT_FOUND = 404;
  const CONFLICT = 409;
  const SERVER_ERROR = 500;

  User.findOne({ email })
    .then((userExists) => {
      if (userExists) {
        throw new errorMiddleware('User already exists', CONFLICT);
      }

      bcrypt
        .hash(password, 10)
        .then((hash) =>
          User.create({
            name,
            email,
            password: hash,
          })
        )
        .then((user) =>
          res.send({
            _id: user._id,
            email: user.email,
          })
        );
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new errorMiddleware('Bad credentials', BAD_METHOD);
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-testing',
        {
          expiresIn: '7d'
        }
      );
      res.send({ token });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    if (!user) {
      throw new errorMiddleware('User doesn\'t exists', NOT_FOUND);
    } else {
      return res.status(200).send({ user });
    }
  });
};
