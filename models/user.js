const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const errorMiddleware = require('../middlewares/errorMiddleware');

const BAD_METHOD = 401;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Colin',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: 'Invalid email',
    },
  },
  password: {
    type: String,
    required: true,
    unique: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new errorMiddleware('Bad credentials', BAD_METHOD);
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new errorMiddleware('Bad credentials', BAD_METHOD);
        }

        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
