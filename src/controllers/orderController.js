const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email");

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

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

  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Not authorized to view this order", 403);
  }

  res.status(200).json({ success: true, data: order });
});

const createOrder = asyncHandler(async (req, res) => {
  let { shippingInformation, shippingPrice = 0 } = req.body || {};

  if (!shippingInformation || !shippingInformation.phone || !shippingInformation.address || !shippingInformation.city) {
    throw new AppError(
      "Please provide shipping information: phone, address, and city are required",
      400
    );
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "title inventory"
  );
  
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      throw new AppError(`Product ${item.product.title} not found`, 404);
    }

    const available = product.inventory.quantity - product.inventory.reserved + item.quantity;

    if (item.quantity > available) {
      throw new AppError(
        `Not enough stock for "${product.title}". Available: ${available}, Requested: ${item.quantity}`,
        400,
      );
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    title: item.product.title,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));

  const itemsTotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const finalTotalPrice = cart.totalPrice + Number(shippingPrice);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingInformation: {
      phone: shippingInformation.phone,
      address: shippingInformation.address,
      city: shippingInformation.city,
      postalCode: shippingInformation.postalCode || undefined,
    },
    shippingPrice: Number(shippingPrice),
    totalPrice: finalTotalPrice,
  });

  const bulkOperations = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: {
          $inc: {
            "inventory.quantity": -Number(item.quantity),
            "inventory.reserved": -Number(item.quantity),
          },
        },
      },
    }));
  
    await Product.bulkWrite(bulkOperations);
  
    // 8. Clear cart
    await Cart.findByIdAndDelete(cart._id);

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

  const bulkOption = order.items.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: {
          quantity: Number(item.quantity),
          sold: -Number(item.quantity),
        },
      },
    },
  }));

  await Product.bulkWrite(bulkOption, {});

  order.status = "cancelled";
  await order.save();

  res.status(200).json({ success: true, data: order });
});

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
};
