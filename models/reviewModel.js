const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
