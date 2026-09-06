const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth");

router.post("/checkout", protect, paymentController.checkout);

module.exports = router;
