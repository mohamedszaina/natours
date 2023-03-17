const mongoose = require('mongoose');
const { Tour } = require('./tourModel');

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

reviewSchema.statics.calcAvarageRatings to basically create the statistics of the average
and number of ratings for the tour ID for which the current review was created.

And we created this function as a static method, because we needed to call the aggregate function on the model.

So in a static method to 'this' variable calls exactly to a method.

So we constructed our aggregation pipeline here where we selected all the reviews that matched
the current tour ID, and then they're calculated, the statistics for all of these reviews.
Then after that was done we saved the statistics to the current tour.

Then in order to actually use this function we call it after a new review has been created.

For that we need to use 'this.constructor' because this is what points to the current model.

*/


reviewSchema.statics.calcAvarageRatings = async function (tourId) {
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
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].numOfRatings,
    ratingsAverage: stats[0].avgOfRatings,
  });
};

reviewSchema.post('save',function(){
  this.constructor.calcAvarageRatings(this.tour)
})
const Review = mongoose.model('Review', reviewSchema);
module.exports = { Review };
