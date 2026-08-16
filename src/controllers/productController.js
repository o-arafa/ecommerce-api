const Product = require("../models/Product");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const mongoose = require("mongoose"); 

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
  const excludedFields = ["page", "sort", "limit", "search"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const filter = JSON.parse(queryStr);

  // searching
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "title")
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    results: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: products,
  });
});

const getProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  
  const isObjectId = mongoose.Types.ObjectId.isValid(productId);
  
  const product = isObjectId
    ? await Product.findById(productId).populate('category', 'title')
    : await Product.findOne({ slug: productId }).populate('category', 'title');
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { category, quantity, ...rest } = req.body;

  const existingCategory = await Category.findById(category);
  if (!existingCategory) {
    throw new AppError("The selected category does not exist", 404);
  }

  const newProduct = await Product.create({
    ...rest,
    category,
    inventory: {
      quantity: quantity || 0,
      reserved: 0,
    },
  });
  
  res.status(201).json(newProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { category } = req.body;

  if (category) {
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      throw new AppError("The selected category does not exist", 404);
    }
  }
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  Object.assign(product, req.body);
  
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: { product },
  });
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
