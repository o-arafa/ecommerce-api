const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const getMyCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "title description"
  );

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalPrice: 0,
    });
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalPrice: 0,
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  cart.totalPrice += product.price * quantity;

  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});

module.exports = { getMyCart, addToCart };
