const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const getAllProducts = asyncHandler(async (req, res) => {
  const query = req.query;
  // pagination
  const limit = Number(query.limit) || 5;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  // sorting
  let sortBy = "-createdAt";
  if (req.query.sort) {
    sortBy = req.query.sort.split(",").join(" ");
  }

  // filtering
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const filter = JSON.parse(queryStr);

  const products = await Product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: products,
  });
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
