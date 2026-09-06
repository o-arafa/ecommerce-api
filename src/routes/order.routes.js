const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const {
  createOrderSchema,
  updateStatusSchema,
} = require("../validators/order.schema");
const orderController = require("../controllers/order.controller");
const { protect, authorize } = require("../middlewares/auth");

router.get("/all", protect, authorize("admin"), orderController.getAllOrders);
router.get("/my-orders", protect, orderController.getMyOrders);
router.get("/:orderId", protect, orderController.getOrderById);
router.post(
  "/",
  protect,
  validate(createOrderSchema),
  orderController.createOrder,
);
router.put("/:id/cancel", protect, orderController.cancelOrder);
router.put(
  "/:orderId/status",
  protect,
  authorize("admin"),
  validate(updateStatusSchema),
  orderController.updateOrderStatus,
);

module.exports = router;
