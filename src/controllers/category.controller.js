const asyncHandler = require("../middlewares/asyncHandler");
const categoryService = require("../services/category.service");

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();

  res.status(200).json({
    success: true,
    data: categories,
  });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategory(req.params.categoryId);

  res.status(200).json({
    success: true,
    data: category,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const category = await categoryService.createCategory({
    title,
    description,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.categoryId,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

module.exports = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
