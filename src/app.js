const express = require("express");
const productRouters = require("./routes/productRoutes");
const errorHandler = require("./middlewares/errorHandler");
// const AppError = require("./utils/AppError");
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.json("API is working");
});

app.use("/api/products", productRouters);
// app.use((req, res, next) => {
//   next(new AppError(`Route ${req.originalUrl} not found`, 404));
// });
app.use(errorHandler);

module.exports = app;
