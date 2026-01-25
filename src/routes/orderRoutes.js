const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { protect } = require("../middlewares/auth");

router.get("/my-orders", protect, orderController.getMyOrders);
router.post("/", protect, orderController.createOrder);

module.exports = router;
