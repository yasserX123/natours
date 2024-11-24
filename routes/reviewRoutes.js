const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true }); //Implementing nested routers step 2

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restritctTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restritctTo('admin', 'user'),
    reviewController.updateReview,
  )
  .delete(
    authController.restritctTo('admin', 'user'),
    reviewController.deleteReview,
  );

module.exports = router;
