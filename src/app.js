const express = require("express");
const productRouters = require("./routes/productRoutes");
const authRouters = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");
const app = express();

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/paymentController").stripeWebhook,
);

app.use(express.json());
app.get("/", (req, res) => {
  res.json("API is working");
});

app.use("/api/products", productRouters);
app.use("/api/auth", authRouters);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(errorHandler);

module.exports = app;
