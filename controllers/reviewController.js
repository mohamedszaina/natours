const { Review } = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Tour } = require('../models/tourModel');
const { deleteOne } = require('./handlerFactory');

const getAllReviews = catchAsync(async (req, res, next) => {
  /*
  So, if there is a tourId, then this filter should be equal to tour: req.params.tourId
  so if there is a tourId,then basically, this object here is what will be here.
  And so then only the reviews where the tour matches the ID are going to be found.
  So if it's all regular API call without nested route, well then that filter will simply be this empty object,
  and so then we're gonna find all the reviews, okay?
  'Show all reviews in a certain tour'
  */
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const review = await Review.find(filter);
  res.status(201).json({
    status: 'suc',
    length: review.length,
    message: { data: review },
  });
});

const createNewReview = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id; // if I didnt put the user ID manually in the postman body
  if (!req.body.tour) req.body.tour = req.params.tourId; // if I didnt put the tour ID manually in the postman body it will be taken from the URL params

  const review = await Review.create(req.body);
  //   review.user = req.user._id;

  res.status(201).json({
    status: 'suc',
    message: { data: review },
  });
});

const deleteReview = deleteOne(Review);

module.exports = { getAllReviews, createNewReview, deleteReview };
