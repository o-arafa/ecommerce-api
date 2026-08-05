const { z } = require('zod');

const categorySchema = z.object({
  title: z.string().trim().min(2, 'Category title must be at least 2 characters').max(50,'Category title must not be at more than 50 characters'),
  description: z.string().trim().min(10, 'Category description must be at least 10 characters').max(500,'Category description must not be at more than 500 characters'),
});


module.exports = categorySchema;