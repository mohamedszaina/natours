const mongoose = require('mongoose');

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


const Review = mongoose.model('Review', reviewSchema);
module.exports = { Review };
