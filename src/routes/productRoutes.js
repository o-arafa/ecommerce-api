const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const productController = require("../controllers/productController");

router
  .route("/")
  .get(productController.getAllProducts)
  .post(protect, authorize("admin"), productController.createProduct);

router
  .route("/:productId")
  .get(productController.getProduct)
  .put(protect, authorize("admin"), productController.updateProduct)
  .delete(protect, authorize("admin"), productController.deleteProduct);

module.exports = router;
