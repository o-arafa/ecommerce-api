const { z } = require('zod');

const addToCartSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1'),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1'),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
};