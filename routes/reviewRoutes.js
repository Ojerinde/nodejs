const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// mergeParams: for '/' to get access to /:tourId
const router = express.Router({ mergeParams: true });

// /tours/12345/reviews end up here
// /reviews also ends up here

router.use(authController.protect); // Protect all the routes below

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrict('user'),
    reviewController.setTourUserId,
    reviewController.createReview
  );

// /reviews/12345
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrict('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrict('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
