const mongoose = require("mongoose");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const getAllOrders = async () => {
  return await Order.find().populate("user", "name email");
};

const getMyOrders = async (userId) => {
  return await Order.find({ user: userId });
};

const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const isOwner = order.user.toString() === user._id.toString();

  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("Not authorized to view this order", 403);
  }

  return order;
};

const createOrder = async (
  userId,
  { shippingInformation, shippingPrice = 0 },
) => {
  //start
  if (
    !shippingInformation ||
    !shippingInformation.phone ||
    !shippingInformation.address ||
    !shippingInformation.city
  ) {
    throw new AppError(
      "Please provide shipping information: phone, address, and city are required",
      400,
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product", "title inventory")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const available =
        product.inventory.quantity - product.inventory.reserved + item.quantity;

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

    const finalTotalPrice = itemsTotal + Number(shippingPrice);

    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          shippingInformation,
          shippingPrice: Number(shippingPrice),
          totalPrice: finalTotalPrice,
        },
      ],
      { session },
    );

    const bulkOperations = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: {
          $inc: {
            "inventory.quantity": -item.quantity,
            "inventory.reserved": -item.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(bulkOperations, {
      session,
    });

    await Cart.findByIdAndDelete(cart._id, {
      session,
    });

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const cancelOrder = async (orderId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.user.toString() !== userId.toString()) {
      throw new AppError("Not authorized", 403);
    }

    if (order.status !== "pending") {
      throw new AppError("Cannot cancel order", 400);
    }

    const bulkOperations = order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            "inventory.quantity": Number(item.quantity),
            "inventory.reserved": -Number(item.quantity),
          },
        },
      },
    }));

    await Product.bulkWrite(bulkOperations, {
      session,
    });

    order.status = "cancelled";

    await order.save({ session });

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateOrderStatus = async (orderId, status) => {
  const allowedTransitions = {
    "pending→processing": true,
    "pending→cancelled": true,
    "processing→shipped": true,
    "processing→cancelled": true,
    "shipped→delivered": true,
  };

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const transition = `${order.status}→${status}`;

  if (!allowedTransitions[transition]) {
    throw new AppError(
      `Cannot change from "${order.status}" to "${status}"`,
      400,
    );
  }

  order.status = status;

  await order.save();

  return order;
};

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  updateOrderStatus,
};
