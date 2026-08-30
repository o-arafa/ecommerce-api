const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const productController = require("../controllers/product.controller");
const validate = require("../middlewares/validate");
const productSchema = require("../validators/product.schema");

router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    protect,
    authorize("admin"),
    validate(productSchema),
    productController.createProduct,
  );

router
  .route("/:productId")
  .get(productController.getProduct)
  .patch(
    protect,
    authorize("admin"),
    validate(productSchema.partial()),
    productController.updateProduct,
  )
  .delete(protect, authorize("admin"), productController.deleteProduct);

module.exports = router;
