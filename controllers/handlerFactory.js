const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('../utils/apiFeatures')

const getAll = Model => catchAsync(async (req, res, next) => {
  // these tow lines of code for the review section only and I put them here becuse its the easy way to do it 
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const features = new apiFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const doc = await features.query;

  // Send data
  res.status(200).json({
    status: 'suc',
    tourLength: doc.length,
    message: {
      data: doc,
    },
  });
});

const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let query = await Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(404, `The document with the id:${id} dos'nt exist!`)
      );
    }
    res.status(200).json({
      status: 'suc',
      message: {
        data: doc,
      },
    });
  });

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'suc',
      message: {
        data: doc,
      },
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new AppError(404, `The document with the id:${id} dos'nt exist!`)
      );
    }
    res.status(200).json({
      status: 'suc',
      message: {
        data: doc,
      },
    });
  });

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(
        new AppError(404, `The document with the id:${id} dos'nt exist!`)
      );
    }
    res.status(204).json({
      status: 'suc',
      message: null,
    });
  });

module.exports = { deleteOne, updateOne, createOne, getOne ,getAll};
