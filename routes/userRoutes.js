const express = require('express');
// const { route } = require('../app');
const {
  getAllusers,
  getuserById,
  createuser,
  updateuser,
  deleteuser,
} = require('../controllers/userControllers');
const {
  signup,
  login,
  isLoginProtection,
  forgetPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const userRoute = express.Router();
// User Routes
userRoute.post('/signup', signup);
userRoute.post('/login', login);

userRoute.post('/forgetPassword', forgetPassword);
userRoute.patch('/resetPassword/:token', resetPassword);
// userRoute.patch('/updatePassword', isLoginProtection, updatePassword);

userRoute.route('/').get(isLoginProtection, getAllusers).post(createuser);

userRoute
  .route('/:id')
  .get(getuserById)
  .patch(isLoginProtection, updateuser)
  .delete(isLoginProtection, deleteuser);

module.exports = userRoute;
