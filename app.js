const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const { errors } = require('celebrate');
const usersRouter = require('./routes/users');
const articlesRouter = require('./routes/articles');
const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const errorMiddleware = require('./middlewares/errorMiddleware');

const NOT_FOUND = 404;
const CONFLICT = 409;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express();


app.use(limiter)

app.use(cors());
app.options('*', cors());

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/aroundb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(helmet());
app.use(express.json());

app.use(requestLogger);

app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin',
    // 'http://localhost:3000'
    'https://api.students.nomoredomainssbs.ru'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, authorization',
  );
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE');
  next();
});

app.post('/signin', login);

app.post('/signup', createUser);

app.use(auth);

app.use('/users', usersRouter);

app.use('/articles', articlesRouter);

app.get('*', () => {
  throw new errorMiddleware(NOT_FOUND, 'Requested resource not found');
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  if (err.name === 'MongoError' || err.code === 11000) {
    throw new errorMiddleware(CONFLICT, 'User already exists!');
  }
  res
    .status(err.statusCode)
    .send({ message: err.statusCode === 500 ? 'Server error' : err.message });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
