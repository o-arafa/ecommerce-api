const express = require("express");
const cartController = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  addToCartSchema,
  updateCartItemSchema,
} = require("../validators/cart.schema");

const router = express.Router();

router.get("/", protect, cartController.getMyCart);
router.post(
  "/add",
  protect,
  validate(addToCartSchema),
  cartController.addToCart,
);
router.delete("/clear", protect, cartController.clearCart);
router
  .route("/:productId")
  .put(protect, validate(updateCartItemSchema), cartController.updateCartItem)
  .delete(protect, cartController.removeFromCart);

module.exports = router;
