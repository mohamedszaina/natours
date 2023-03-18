// const fs = require('fs');
const { Tour } = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

// const tourSimplePath = `${__dirname}/../dev-data/data/tours-simple.json`;
// const tours = JSON.parse(fs.readFileSync(tourSimplePath));

// const checkBody = (req, res, next) => {
//   const { name, price } = req.body;
//   if (!name || !price) {
//     return res
//       .status(404)
//       .json({ status: 'fail', message: 'Missing name or price' });
//   }
//   next();
// };

// const checkId = (req, res, next, val) => {
//   console.log(`the tour id = ${val}`);
//   const { id } = req.params;
//   // const tour = tours.find((e) => parseInt(id) === e.id); //considering the data type in the equalization process
//   // const tour = tours.find((e) => id == e.id); // not considering the data type in the equalization process
//   // if (!tour)
//   if (parseInt(id) > tours.length) {
//     return res.status(404).json({ status: 'fail', message: 'not found' });
//   }
//   next();
// };

// Handlers
//Tour Handlers

const aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.fields = 'name,ratingAverage,price,summary,difficulty';
  req.query.sort = 'ratingAverage,price';
  next();
};

const getAllTours = getAll(Tour);
// const getAllTours = catchAsync(async (req, res, next) => {
//   // Build the query
//   // 1A) Filtering
//   // const queryObj = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((el) => delete queryObj[el]); // to exclude ['page', 'sort', 'limit', 'fields'] from the queryObj

//   // console.log(queryObj);
//   // console.log(req.query);

//   // 1B) Advanced Filtering
//   // let queryStr = JSON.stringify(queryObj); // To convert the object to a string
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   // const advancedqueryObj = JSON.parse(queryStr); // To convert the string to an object
//   // console.log(advancedqueryObj);

//   // let toursQuery = Tour.find(advancedqueryObj);

//   // 2) Sorting
//   // const { sort } = req.query;
//   // if (sort) {
//   //   const sortBy = sort.split(',').join(' ');
//   //   // console.log(sort);
//   //   // console.log(sortBy);
//   //   toursQuery = toursQuery.sort(sortBy);
//   // } else {
//   //   toursQuery = toursQuery.sort('-createdAt');
//   // }

//   // // 3) Fields limiting
//   // // (Specifies which document fields to include or exclude (also known as the query "projection"))
//   // const { fields } = req.query;
//   // if (fields) {
//   //   // document fields to include
//   //   const fieldsLimits = fields.split(',').join(' ');
//   //   toursQuery = toursQuery.select(fieldsLimits);
//   // } else {
//   //   // document fields to exclude
//   //   toursQuery = toursQuery.select('-__v -createdAt');
//   // }

//   // // 4) pagination (how many documents to show per page)
//   // // *1 means:-> convert the value from string to number
//   // // ||1 means:-> the default value is 1 if there is no value
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;
//   // toursQuery = toursQuery.skip(skip).limit(limit);
//   // // if the page doesn't exists
//   // const numberOfDocuments = await Tour.countDocuments();
//   // if (skip >= numberOfDocuments) {
//   //   throw new Error("This page doesn't exist");
//   // }

//   // Execute query
//   const features = new apiFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();
//   const tours = await features.query;

//   // Send data
//   res.status(200).json({
//     status: 'suc',
//     tourLength: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

// To populate the review inside the tour pass the options as parameter inside the getOne()
const getTourById = getOne(Tour, { path: 'reviews' });
// const getTourById = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const tourData = await Tour.findById(id).populate('reviews')
//  /*
//   * I made a mongo pre middleware in the tour module insted of dublicating the populare all over the code
//   .populate({
//     path: 'guides',
//     select: '-passwordChangedAt -__v',
//   });*/
//   /*
//   * With populate in the select field :
//   * when we put (-) before the field name it will hide it and show other fields info
//   * but when we don't put(-) before the field then it will only show that field and hide the other fields info
//   */
//   // * considering the data type in the equalization process
//   // const tour = tours.find((e) => id == e.id); // * not considering the data type in the equalization process
//   if (!tourData) {
//     return next(new AppError(404, `The tour with the id:${id} dos'nt exist!`));
//   }
//   res.status(200).json({
//     status: 'suc',
//     data: {
//       tour: tourData,
//     },
//   });
// });

const createTour = createOne(Tour);

// const createTour = catchAsync(async (req, res, next) => {
//   // const tourNewId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign({ id: tourNewId }, req.body);
//   // console.log(newTour);
//   // tours.push(newTour);
//   // fs.writeFile(tourSimplePath, JSON.stringify(tours), (err) => {
//   //   if (err) {
//   //     return res.status(404).send('Error');
//   //   } else {

//   //     res.status(201).json({
//   //       status: 'suc',
//   //       data: {
//   //         tour: newTour,
//   //       },
//   //     });
//   //   }
//   // });
//   const newTour = await Tour.create(req.body);
//   // await newTour.save();
//   res.status(201).json({
//     status: 'suc',
//     data: {
//       tour: newTour,
//     },
//   });
// });

const updateTour = updateOne(Tour);

// const updateTour = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const tour = await Tour.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   // await tour.save();
//   // const tour = tours.find((e) => parseInt(id) === e.id); //considering the data type in the equalization process
//   // const tour = tours.find((e) => id == e.id); // not considering the data type in the equalization process
//   if (!tour) {
//     return next(new AppError(404, `The tour with the id:${id} dos'nt exist!`));
//   }
//   res.status(200).json({
//     status: 'suc',
//     data: {
//       tour,
//     },
//   });
// });

const deleteTour = deleteOne(Tour);

// const deleteTour = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const tour = await Tour.findByIdAndDelete(id);
//   // const tour = tours.find((e) => parseInt(id) === e.id); //considering the data type in the equalization process
//   // const tour = tours.find((e) => id == e.id); // not considering the data type in the equalization process
//   if (!tour) {
//     return next(new AppError(404, `The tour with the id:${id} dos'nt exist!`));
//   }
//   res.status(204).json({
//     status: 'suc',
//     data: {
//       tour: 'Deleted tour',
//     },
//   });
// });

const getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  // console.log(stats);

  res.status(200).json({
    status: 'suc',
    data: {
      tour: stats,
    },
  });
});
const monthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
      //Deconstructs an array field from the input documents to output a document for each element.
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
      //Filters the documents to pass only the documents that match the specified condition(s) to the next pipeline stage.
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        price: { $sum: '$price' },
        toursInformation: {
          $push: {
            name: '$name',
            price: '$price',
            difficulty: '$difficulty',
          },
        },
      },
      //The $group stage separates documents into groups according to a "group key". The output is one document for each unique group key.
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  // console.log(stats);

  res.status(200).json({
    status: 'suc',
    length: stats.length,
    data: {
      tour: stats,
    },
  });
});

const getToursWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }
  // console.log(distance, latlng, unit);
  // console.log(lat, lng);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'suc',
    length: tours.length,
    data: {
      data: tours,
    },
  });
});

const getToursDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const convertDistance = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: { // $geoNear properte must be the first index in the pipeline aggregate in the whole project
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // '* 1' to convert it to an Integer
        },
        distanceField: 'distance',
        distanceMultiplier: convertDistance, 
      },
    },
    {
      $project: { // show only => name and distance
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'suc',
    data: {
      data: distances,
    },
  });
});

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  monthlyPlan,
  getToursWithIn,
  getToursDistance,
  // checkId,
  // checkBody,
};
