const { User } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// User Handlers
const getAllusers = catchAsync(async (req, res, next) => {
  const userdata = await User.find();
  if (userdata.length == 0) {
    return next(new AppError(404, `No users exist yet!`));
  }
  res.status(200).json({
    status: 'suc',
    length: userdata.length,
    data: {
      user: userdata,
    },
  });
});
const createuser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'suc',
    message: {
      user: newUser,
    },
  });
});
const getuserById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError(404, `The user with the id:${id} dos'nt exist!`));
  }
  res.status(200).json({
    status: 'suc',
    message: {
      user,
    },
  });
});
const updateuser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError(404, `The user with the id:${id} dos'nt exist!`));
  }
  res.status(201).json({
    status: 'suc',
    message: {
      user,
    },
  });
});
const deleteuser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError(404, `The user with the id:${id} dos'nt exist!`));
  }
  res.status(204).json({
    status: 'suc',
    message: 'Deleted suc',
  });
});
module.exports = {
  getAllusers,
  getuserById,
  createuser,
  updateuser,
  deleteuser,
};
