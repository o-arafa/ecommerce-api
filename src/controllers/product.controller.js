const asyncHandler = require("../middlewares/asyncHandler");
const productService = require("../services/product.service");

const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: {
      results: result.products.length,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      currentPage: result.page,
    },
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.productId);

  res.status(200).json({
    success: true,
    data: product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.productId,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.productId);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
