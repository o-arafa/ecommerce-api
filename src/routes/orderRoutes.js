const express = require("express");
const router = express.Router();
const validate = require('../middlewares/validate');
const createOrderSchema = require('../validators/order.schema');
const orderController = require("../controllers/orderController");
const { protect,authorize } = require("../middlewares/auth");

router.get("/all", protect, authorize("admin"), orderController.getAllOrders);
router.get("/my-orders", protect, orderController.getMyOrders);
router.get("/:orderId", protect, orderController.getOrderById);
router.post("/", protect, validate(createOrderSchema), orderController.createOrder);
router.put("/:id/cancel", protect, orderController.cancelOrder);

module.exports = router;
