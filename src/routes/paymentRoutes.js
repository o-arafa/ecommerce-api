const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middlewares/auth");

router.post(
  "/checkout",
  protect,
  paymentController.checkout,
);

module.exports = router;
