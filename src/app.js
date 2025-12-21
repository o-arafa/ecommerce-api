const express = require("express");
const productRouters = require("./routes/productRoutes");
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.json("API is working");
});

app.use("/api/products", productRouters);

module.exports = app;
