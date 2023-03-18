const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const { User } = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      //both ways are correct (I didn't use it because it checks for spaces beside numbers so it was'nt useful here)
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
      // validate:{
      //   validator:validator.isAlpha,
      //   message:'Tour name must only contain characters'
      // }
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // So set and this function will be run each time that a new value is set for this field
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      //mongoose custom validator
      validate: {
        validator: function (val) {
          // (this) only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover Image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // document fields to exclude from the database by select
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        day: Number,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// mongodb index
/* 
So when all we ever do is to just query for one single field alone,
then a single field index is perfect because remember the index that we just set
before is called a single field index.
Not sure if I mentioned it back then but I think I did.
But anyway, if we sometimes query for that field but combined with another one,
then it's actually more efficient to create a compound index.
"compound indexes, where a single index structure holds references to multiple fields within a collection's documents"
"So one with two fields and not just one."

why don't we set indexes on all the fields?

The reason for that is that each index actually uses resources,
so as you can actually see here right.
And also, each index needs to be updated each time
that the underlying collection is updated.
So if you have a collection with a high write-read ratio,
so a collection that is mostly written to, then it would make absolutely no sense
to create an index on any field in this collection because the cost of always updating the index
and keeping it in memory clearly outweighs the benefit of having the index in the first place
if we rarely have searches, so have queries, for that collection.
*/
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// Document Middleware it works only for create and save
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding way
/* 
So the idea here is that when creating a new tour document, the user will simply
add an array of user IDs, and we will then get the corresponding user documents
based on these IDs, and add them to our tour documents.
So in other words, we embed them into our tour.
*/
// tourSchema.pre('save',async function (next) {
//   // you can do it like this too.
//   // const ids = this.guides.map(id => User.findById(id));
//   // this.guides = await Promise.all(ids);

//   const ids = this.guides;
//   // This will prevent multiple DB calls if there are more than 2+ ids in guides array and also a map() function.
//   this.guides = await User.find({ _id: { $in: ids } });
//   next()
// });

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// * the pupulate Query Middleware for evrey find word in the code
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-passwordChangedAt -__v',
  });
  next();
});
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} ms`);
//   // console.log(docs);
//   next();
// });
// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = { Tour };
