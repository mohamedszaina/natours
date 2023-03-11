const express = require('express');
const {
  getAllReviews,
  setTourUserIds,
  getReviewById,
  createNewReview,
  deleteReview,
  updateReview,
} = require('../controllers/reviewController');
const {
  isLoginProtection,
  restrictTo,
} = require('../controllers/authController');

// Thanks to {mergeParams:true} we can get access to review id which actually comes from the other router before which is the tourRoute.use('/:tourId/reviews', reviewRoute);.
const reviewRoute = express.Router({ mergeParams: true });

reviewRoute
  .route('/')
  .get(getAllReviews)
  .post(
    isLoginProtection,
    restrictTo('user', 'admin'),
    setTourUserIds,
    createNewReview
  );

reviewRoute
  .route('/:id')
  .get(getReviewById)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = reviewRoute;
