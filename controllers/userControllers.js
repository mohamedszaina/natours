const { User } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');

const objFilter = (obj, ...allowedObjData) => {
  const newObj = {};
  /*  loop through the object and for each element check
      if it's one of the allowed fields,
      and if it is, simply add it to a new object,
      that we're then gonna return in the end.
  */
  Object.keys(obj).forEach((el) => {
    if (allowedObjData.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// User Handlers
const getAllUsers = getAll(User)
// const getAllUsers = catchAsync(async (req, res, next) => {
//   const userdata = await User.find();
//   if (userdata.length == 0) {
//     return next(new AppError(404, `No users exist yet!`));
//   }
//   res.status(200).json({
//     status: 'suc',
//     length: userdata.length,
//     data: {
//       user: userdata,
//     },
//   });
// });

const createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message:'This rout is not defined! use /signup instead' 
  });
});

const getMe = (req,res,next)=>{
  req.params.id = req.user.id;
  next();
}
const getUserById = getOne(User);
// const getUserById = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const user = await User.findById(id);
//   if (!user) {
//     return next(new AppError(404, `The user with the id:${id} dos'nt exist!`));
//   }
//   res.status(200).json({
//     status: 'suc',
//     message: {
//       user,
//     },
//   });
// });

// this updateMe is for the user to update his/her own data
const updateMe = catchAsync(async (req, res, next) => {
  // 1) no passwords info should enter in the body
  if (req.body.password || req.body.passwordConfirm) {
    const message =
      'This rout is not for password updates. use /updatePassword';
    return next(new AppError(404, message));
  }
  // 2) filter the data that is gonna come from the body
  const filteredBody = objFilter(req.body, 'name', 'email');
  // 2) update user document
  const userUpdate = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'suc',
    data: {
      user: userUpdate,
    },
  });
});

// this updateUser is for the admin to update the user data
const updateUser = updateOne(User);
// const updateUser = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const user = await User.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!user) {
//     return next(new AppError(404, `The user with the id:${id} dos'nt exist!`));
//   }
//   res.status(201).json({
//     status: 'suc',
//     message: {
//       user,
//     },
//   });
// });

// For activate and deactivate the user account but not deleting it.
const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'suc',
    message: {
      data: null,
    },
  });
});

// For deleting the user account permanently By the ADMIN
const deleteUser = deleteOne(User);
// const deleteUser = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const user = await User.findByIdAndDelete(id);
//   if (!user) {
//     return next(new AppError(404, `The user with the id:${id} dos'nt exist!`));
//   }
//   res.status(204).json({
//     status: 'suc',
//     message: 'Deleted suc',
//   });
// });

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
};
