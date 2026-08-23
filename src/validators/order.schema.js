const { z } = require('zod');

const shippingSchema = z.object({
  phone: z.string().min(8, 'Phone must be at least 8 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().optional(),
});

const createOrderSchema = z.object({
  shippingInformation: shippingSchema,
  shippingPrice: z.number().min(0).default(0),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

module.exports = {
  createOrderSchema,
  updateStatusSchema,
};