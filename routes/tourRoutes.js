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
  monthlyPlan,
  // checkId,
  // checkBody,
} = require('./../controllers/tourControllers');
const tourRoute = express.Router();
// tourRoute.param('id', checkId);
tourRoute.route('/tour-stats').get(getTourStats);
tourRoute.route('/monthly-plan/:year').get(monthlyPlan);
tourRoute.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRoute.route('/').get(getAllTours).post(createTour);
tourRoute
  .route('/:id')
  .get(getTourById)
  .patch(isLoginProtection, updateTour)
  .delete(isLoginProtection, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = tourRoute;
