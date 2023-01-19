const express = require('express');
// const { route } = require('../app');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
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
userRoute.patch('/updatePassword', isLoginProtection, updatePassword);
userRoute.patch('/updateMe', isLoginProtection, updateMe);

userRoute.delete('/deleteMe', isLoginProtection, deleteMe);

userRoute.route('/').get(isLoginProtection, getAllUsers).post(createUser);

userRoute
  .route('/:id')
  .get(getUserById)
  .patch(isLoginProtection, updateUser)
  .delete(isLoginProtection, deleteUser);

module.exports = userRoute;
