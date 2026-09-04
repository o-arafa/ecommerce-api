const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const getMyCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "title description",
  );

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalPrice: 0,
    });
  }

  return cart;
};

const addToCart = async (userId, { productId, quantity }) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalPrice: 0,
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  const currentInCart = existingItem ? existingItem.quantity : 0;

  const totalRequested = currentInCart + quantity;

  const available = product.inventory.quantity - product.inventory.reserved;

  if (totalRequested > available) {
    throw new AppError(
      `Only ${available} items available. You have ${currentInCart} in cart.`,
      400,
    );
  }

  product.inventory.reserved += quantity;

  await product.save();

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  await cart.save();

  return cart;
};

const updateCartItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    throw new AppError("Item not found", 404);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const oldQuantity = cart.items[itemIndex].quantity;

  const quantityDiff = quantity - oldQuantity;

  const available = product.inventory.quantity - product.inventory.reserved;

  if (quantityDiff > 0 && quantityDiff > available) {
    throw new AppError(`Only ${available} more items available`, 400);
  }

  product.inventory.reserved += quantityDiff;

  await product.save();

  cart.items[itemIndex].quantity = quantity;

  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "title description",
  );

  return updatedCart;
};

const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const removedItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (!removedItem) {
    throw new AppError("Item not found", 404);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.inventory.reserved -= removedItem.quantity;

  await product.save();

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "title description",
  );

  return updatedCart;
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product);

    if (product) {
      product.inventory.reserved -= item.quantity;
      await product.save();
    }
  }

  cart.items = [];

  await cart.save();

  return cart;
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
