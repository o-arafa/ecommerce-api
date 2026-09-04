const asyncHandler = require("../middlewares/asyncHandler");
const orderService = require("../services/order.service");

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user._id);

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId, req.user);

  res.status(200).json({
    success: true,
    data: order,
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.orderId,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.orderId,
    req.body.status,
  );

  res.status(200).json({
    success: true,
    message: `Order status updated to ${order.status}`,
    data: order,
  });
});

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  updateOrderStatus,
};
