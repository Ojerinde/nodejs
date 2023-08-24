const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is required']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    //   Parent referencing
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour is required']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Query middleware
reviewSchema.pre(/^find/, function(next) {
  this.select('-__v');

  this.start = Date.now();
  next();
});

reviewSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);

  next();
});

// Popluating the parents.
reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'tours',
  //     select: 'name'
  //   }).populate({
  //     path: 'users',
  //     select: 'name photo'
  //   });
  this.populate({
    path: 'users',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this point to the model and aggregate can only be called on the model. Hence the reason for using statics
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour', //grouping by tour
        nRating: { $sum: 1 }, //add 1 for each doc
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
};

// This also work
reviewSchema.pre('save', function(next) {
  // console.log('pre', this); this === current review (doc in post)
  // this points to current review, this.constructor point to the model
  // use this.constructor since Review Model s not available yet at this point
  // this.constructor.calcAverageRatings(this.tour);

  next();
});

// Calculate the avgRating only when it has been saved.
reviewSchema.post('save', function(doc, next) {
  // console.log('post', this, doc); this === doc
  this.constructor.calcAverageRatings(this.tour);

  next();
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  const r = await this.findOne();
  console.log(r);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
