const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const categoryController = require("../controllers/category.controller");
const validate = require("../middlewares/validate");
const categorySchema = require("../validators/category.schema");
const router = express.Router();

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(
    protect,
    authorize("admin"),
    validate(categorySchema),
    categoryController.createCategory,
  );

router
  .route("/:categoryId")
  .get(categoryController.getCategory)
  .patch(
    protect,
    authorize("admin"),
    validate(categorySchema.partial()),
    categoryController.updateCategory,
  )
  .delete(protect, authorize("admin"), categoryController.deleteCategory);

module.exports = router;
