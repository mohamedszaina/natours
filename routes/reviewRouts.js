const express = require('express');
const {
  getAllReviews,
  createNewReview,
} = require('../controllers/reviewController');
const {
  isLoginProtection,
  restrictTo,
} = require('../controllers/authController');

const reviewRoute = express.Router();

reviewRoute
  .route('/')
  .get(getAllReviews)
  .post(isLoginProtection, restrictTo('user'), createNewReview);

module.exports = reviewRoute;
