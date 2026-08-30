const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const getAllCategories = async () => {
  return Category.find();
};

const getCategory = async (categoryId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(categoryId);

  const category = isObjectId
    ? await Category.findById(categoryId)
    : await Category.findOne({ slug: categoryId });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

const createCategory = async ({ title, description }) => {
  return await Category.create({ title, description });
};

const updateCategory = async (categoryId, updateData) => {
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new AppError("Please provide at least one field to update", 400);
  }

  const category = await Category.findByIdAndUpdate(categoryId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

const deleteCategory = async (categoryId) => {
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

  return deletedCategory;
};

module.exports = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
