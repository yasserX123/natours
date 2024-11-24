const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter); //implementing nested router step 1

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restritctTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//tours-within/233/center/-40,50/unit/mi
//tours-within?distance=233&center=-40,45&unit=mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances); // calculate the distance between each
// tour and the start location

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restritctTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restritctTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restritctTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
