const mongoose = require('mongoose');
const { Tour } = require('./tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      max: 5,
      min: 0,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    /*  all this does is to really make sure
        that when we have a virtual property,
        basically a field that is not stored in the database
        but calculated using some other value.
        So we want this to also show up whenever there is an output.
    */
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* 
By putting the index unique for tour and user in a compaound Index => preventing duplicate reviews from the same user for each tour.
Now each combination of tour and user has always to be unique 
each user should only review each tour once.
So basically, a duplicate review happens when there is a review with the same user
and the same tour ID and that what we wanna prevent.
'prevent users from writing multiple reviews for the same tours.'
*/
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); 


reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //     path:'user',
  //     select:'name'
  // }).populate({
  //     path:'tour',
  //     select:'name'
  // })
  this.populate({
    path: 'user',
    select: 'name photo', // to populate more than a field put a space between them.
  });
  next();
});

/*

reviewSchema.statics.calcAverageRatings to basically create the statistics of the average
and number of ratings for the tour ID for which the current review was created.

And we created this function as a static method, because we needed to call the aggregate function on the model.

So in a static method to 'this' variable calls exactly to a method.

So we constructed our aggregation pipeline here where we selected all the reviews that matched
the current tour ID, and then they're calculated, the statistics for all of these reviews.
Then after that was done we saved the statistics to the current tour.

Then in order to actually use this function we call it after a new review has been created.

For that we need to use 'this.constructor' because this is what points to the current model.

*/

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numOfRatings: { $sum: 1 },
        avgOfRatings: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numOfRatings,
      ratingsAverage: stats[0].avgOfRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Calculating Average Rating Rivews on Tours When Creating A New Reivew
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// Calculating Average Rating Rivews on Tours When Updated or Deleted
/*
The old way 
So in order to be able to run 'calcAverageRatings' function here also on update and on delete,
we actually need to use the query middleware that Mongoose gives us for these situations.

Okay, so, we do not have a handy document middleware, which works, for these functions,
but instead we need to use the query middleware, and in that one, we do not directly have access
to the current document.
And so we need to go around that by using this findOne here, and so basically retrieving
the current document from the database.

We then store it on the current query variable, and so that's 'this', and by doing that,
we then get access to it in the 'post middleware'.

And it's then only in the post middleware where we actually calculate the statistics for reviews.
And remember that we do it this way because if we did it right in the 'pre' middleware function,
then the underlying data would not have been updated at that point and so the calculated statistics
would not really be up to date. 
And so that's why we used this two-step process here basically.
*/
// findByIdAndUpdate
// findByIdAndDelete
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.rev = await this.clone().findOne();
//   // console.log(this.rev);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   // await this.findOne(); does NOT work here, query has already executed
//   await this.rev.constructor.calcAverageRatings(this.rev.tour);
// });

// Calculating Average Rating Rivews on Tours When Updated or Deleted The new way
reviewSchema.post(
  /^findOneAnd/,
  // catchAsync(
  async (doc, next) => {
    console.log('Before this is docccccccccc', doc);
    // if (!doc._id) {
    //   return next(
    //     new AppError(
    //       404,
    //       `The document with the id:${doc._id} dos'nt exist!`
    //     )
    //   );
    // }
    await doc.constructor.calcAverageRatings(doc.tour);
    console.log('After this is docccccccccc', doc);
    next();
  }
);
// );

const Review = mongoose.model('Review', reviewSchema);
module.exports = { Review };
