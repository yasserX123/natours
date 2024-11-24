/* NOT IMPLEMENTED
const express = require('express');

const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router(); //Implementing nested routers step 2

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = router;
*/
