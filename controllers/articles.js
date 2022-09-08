const Article = require('../models/article');
const errorMiddleware = require('../middlewares/errorMiddleware');

const NOT_FOUND = 404;
const FORBIDEN = 403;

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .then((articles) => res.status(200).send({ articles }))
    .catch(next);
}

module.exports.createArticle = (req, res, next) => {
  const { keyword, title, text, date, source, link, image } = req.body;

  Article.create({ keyword, title, text, date, source, link, image, owner: req.user._id })
    .then((article) => res.status(200).send({ article }))
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findByIdAndRemove(req.params.id)
    .then((article) => {
      if (!article) {
        throw new errorMiddleware('Not found' ,NOT_FOUND);
      } else if (article.owner.toString() !== req.user._id) {
        throw new errorMiddleware('forbiden' ,FORBIDEN);
      }
      res.status(200).send({ article });
    })
    .catch(next);
};
