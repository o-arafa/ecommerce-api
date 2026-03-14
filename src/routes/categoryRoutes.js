const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const categoryController = require("../controllers/categoryController");

router
  .route("/")
  .get(categoryController.getAllCategorys)
  .post(protect, authorize("admin"), categoryController.createCategory);

router
  .route("/:categoryId")
  .get(categoryController.getCategory)
  .put(protect, authorize("admin"), categoryController.updateCategory)
  .delete(protect, authorize("admin"), categoryController.deleteCategory);

module.exports = router;
