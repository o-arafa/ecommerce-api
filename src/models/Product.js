const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [1, "Price must be greater than zero"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [1, "Quantity must be greater than zero"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
