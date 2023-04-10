const express = require('express');
const {
  isLoginProtection,
  restrictTo,
} = require('../controllers/authController');
const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  monthlyPlan,getToursWithIn, getToursDistance,
  // checkId,
  // checkBody,
} = require('./../controllers/tourControllers');
const reviewRoute = require('./reviewRouts');

const tourRoute = express.Router();
// tourRoute.param('id', checkId);

// It will be redirected to the reviewRoute whenever the url matches '/:tourId/reviews'.
tourRoute.use('/:tourId/reviews', reviewRoute);

tourRoute.route('/tour-stats').get(getTourStats);
tourRoute
  .route('/monthly-plan/:year')
  .get(
    isLoginProtection,
    restrictTo('admin', 'lead-guide', 
    // 'guide'
    ),
    monthlyPlan
  );
tourRoute.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRoute.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithIn);
tourRoute.route('/distance/:latlng/unit/:unit').get(getToursDistance);
tourRoute
  .route('/')
  .get(getAllTours)
  .post(isLoginProtection, restrictTo('admin', 'lead-guide'), createTour);
tourRoute
  .route('/:id')
  .get(getTourById)
  .patch(isLoginProtection, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(isLoginProtection, restrictTo('admin', 'lead-guide'), deleteTour);

// I did this code before I use the mearge in the review router
// tourRoute.route('/:tourId/reviews').post(isLoginProtection,restrictTo('user'),createNewReview)
module.exports = tourRoute;
