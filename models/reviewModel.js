const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //Preventing Duplicate Reviews

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  next();
});

// Calculating ratingsAverage and Qunatity from Tour model
// We define statics so we can call it from the same model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats);
  // Updates the data inside the tour model

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // runs after saving the review
  // this points to the current review (document)
  // constructor is the model who created the document
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// Query Middleware these to update and delete ratingAverage and ratingQuantities
// we use regular expression because we can't access findByIdAndUpdate and findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne(); //retrieves the current review and save it to this so the next post middleware can access it
  //Mongoose no longer allows executing the same query object twice. If you do, you'll get a Query was already executed error.
  // Executing the same query instance twice is typically indicative of mixing callbacks and promises, but if you need to execute
  // the same query twice, you can call ".clone();" to clone the query and re-execute it.
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does not work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour); // same as adding review but now we are accessing the r doc
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
