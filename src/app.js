const express = require("express");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");

const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");
const app = express();

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/payment.controller").stripeWebhook,
);

app.use(express.json());
app.get("/", (req, res) => {
  res.json("API is working");
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(errorHandler);

module.exports = app;
