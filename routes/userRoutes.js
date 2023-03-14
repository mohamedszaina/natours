const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userControllers');
const {
  signup,
  login,
  isLoginProtection,
  forgetPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} = require('../controllers/authController');

const userRoute = express.Router();
// User Routes
userRoute.get('/me', isLoginProtection, getMe, getUserById);

userRoute.post('/signup', signup);
userRoute.post('/login', login);
userRoute.post('/forgetPassword', forgetPassword);
userRoute.patch('/resetPassword/:token', resetPassword);

/* 
what this will do
is to basically protect all the routes that come after this point because middleware runs in sequence.
*/
userRoute.use(isLoginProtection);

userRoute.patch('/updatePassword', updatePassword);
userRoute.patch('/updateMe', updateMe);
userRoute.delete('/deleteMe', deleteMe);

userRoute.use(restrictTo('admin'));

userRoute.route('/').get(getAllUsers).post(createUser);

userRoute.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);
// .delete( restrictTo('admin'), deleteUser);

module.exports = userRoute;
