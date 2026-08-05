const { z } = require('zod');

const productSchema = z.object({
  title: z.string().trim().min(2, 'Category title must be at least 2 characters').max(100,'Category title must not be at more than 100 characters'),
  description: z.string().trim().min(10, 'Category description must be at least 10 characters').max(500,'Category description must not be at more than 500 characters'),
  price: z.number().min(0,'Price cannot be negative'),
  quantity: z.number().min(0,'Quantity cannot be negative'),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  
});

module.exports = productSchema;