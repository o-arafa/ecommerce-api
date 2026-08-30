const Product = require("../models/Product");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");

const getAllProducts = async (query) => {
  // pagination
  const limit = Number(query.limit) || 5;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  // sorting
  let sortBy = "-createdAt";

  if (query.sort) {
    sortBy = query.sort.split(",").join(" ");
  }

  // filtering
  const queryObj = { ...query };

  const excludedFields = ["page", "sort", "limit", "search"];

  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);

  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const filter = JSON.parse(queryStr);

  // searching
  if (query.search) {
    filter.$or = [
      {
        title: {
          $regex: query.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: query.search,
          $options: "i",
        },
      },
    ];
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "title")
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  return {
    products,
    total,
    limit,
    page,
  };
};

const getProduct = async (productId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(productId);

  const product = isObjectId
    ? await Product.findById(productId).populate("category", "title")
    : await Product.findOne({ slug: productId }).populate("category", "title");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const createProduct = async (productData) => {
  const { category, quantity, ...rest } = productData;

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

  return newProduct;
};

const updateProduct = async (productId, updateData) => {
  const { category } = updateData;

  if (category) {
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      throw new AppError("The selected category does not exist", 404);
    }
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  Object.assign(product, updateData);

  await product.save();

  return product;
};

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
