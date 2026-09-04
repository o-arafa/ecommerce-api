const asyncHandler = require("../middlewares/asyncHandler");
const cartService = require("../services/cart.service");

const getMyCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getMyCart(req.user._id);

  res.status(200).json({
    success: true,
    data: cart,
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const cart = await cartService.addToCart(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(
    req.user._id,
    req.params.productId,
    req.body.quantity,
  );

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: cart,
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(
    req.user._id,
    req.params.productId,
  );

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: cart,
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: cart,
  });
});

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
