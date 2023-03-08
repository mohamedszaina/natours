const express = require('express');
const {
  getAllReviews,
  createNewReview,
} = require('../controllers/reviewController');
const {
  isLoginProtection,
  restrictTo,
} = require('../controllers/authController');

// Thanks to {mergeParams:true} we can get access to review id which actually comes from the other router before which is the tourRoute.use('/:tourId/reviews', reviewRoute);.
const reviewRoute = express.Router({mergeParams:true});


reviewRoute
  .route('/')
  .get(getAllReviews)
  .post(isLoginProtection, restrictTo('user'), createNewReview);

module.exports = reviewRoute;
