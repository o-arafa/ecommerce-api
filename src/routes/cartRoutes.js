const express = require("express");
const router = express.Router();

const productController = require("../controllers/cartController");
const { protect } = require("../middlewares/auth");

router
  .route("/")
  .get(protect, productController.getMyCart)
  .post(protect, productController.addToCart)
  .delete(protect, productController.clearCart);
router
  .route("/:productId")
  .put(protect, productController.updateCartItem)
  .delete(protect, productController.removeFromCart);

module.exports = router;
