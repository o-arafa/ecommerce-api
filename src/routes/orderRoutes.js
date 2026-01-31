const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { protect } = require("../middlewares/auth");

router.get("/", protect, orderController.getMyOrders);
router.get("/:orderId", protect, orderController.getOrderById);
router.post("/", protect, orderController.createOrder);
router.put("/:id/cancel", protect, orderController.cancelOrder);

module.exports = router;
