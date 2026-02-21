const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middlewares/auth");

router.post(
  "/create-payment-intent",
  protect,
  paymentController.createPaymentIntent,
);

module.exports = router;
