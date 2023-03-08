const { Review } = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Tour } = require('../models/tourModel');

const getAllReviews = catchAsync(async (req, res, next) => {
  const review = await Review.find();
  res.status(201).json({
    status: 'suc',
    length: review.length,
    message: { data: review },
  });
});

const createNewReview = catchAsync(async (req, res, next) => {


  if(!req.body.user) req.body.user = req.user.id; // if I didnt put the user ID manually in the postman body
  if(!req.body.tour) req.body.tour = req.params.tourId; // if I didnt put the tour ID manually in the postman body it will be taken from the URL params

  const review = await Review.create(req.body);
//   review.user = req.user._id;

  res.status(201).json({
    status: 'suc',
    message: { data: review },
  });
});

module.exports = { getAllReviews, createNewReview };
