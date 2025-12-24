const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.status(200).json(products);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.status(201).json(newProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({ message: "Product has been deleted" });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
