const Category = require("../models/Category");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    data: categories,
  });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const newCategory = await Category.create({
    title,
    description,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: newCategory,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError("Please provide at least one field to update", 400);
  }

  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const productExists = await Product.findOne({ category: categoryId });

  if (productExists) {
    throw new AppError(
      "Cannot delete category: It has associated products",
      400,
    );
  }

  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  if (!deletedCategory) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Category has been deleted successfully",
  });
});

module.exports = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
