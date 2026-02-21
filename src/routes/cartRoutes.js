const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const { protect } = require("../middlewares/auth");

router
  .route("/")
  .get(protect, cartController.getMyCart)
  .post(protect, cartController.addToCart)
  .delete(protect, cartController.clearCart);
router
  .route("/:productId")
  .put(protect, cartController.updateCartItem)
  .delete(protect, cartController.removeFromCart);

module.exports = router;
