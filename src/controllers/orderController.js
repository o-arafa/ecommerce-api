const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  // if (!orders) {
  //   throw new AppError("Order not found", 400);
  // }

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized", 403);
  }

  res.status(200).json({ success: true, data: order });
});

const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      throw new AppError(`Product ${item.product.title} not found`, 404);
    }

    if (product.quantity < item.quantity) {
      throw new AppError(
        `Not enough stock for ${product.title}. Available: ${product.quantity}`,
        400,
      );
    }
  }

  const order = await Order.create({
    user: req.user._id,
    items: cart.items,
    totalPrice: cart.totalPrice,
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity },
    });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    data: order,
  });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized", 403);
  }

  if (order.status !== "pending") {
    throw new AppError("Cannot cancel order", 400);
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: item.quantity },
    });
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({ success: true, data: order });
});

module.exports = {
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
};
