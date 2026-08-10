const mongoose = require("mongoose");
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
    },
    description: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.pre('save',async function() {
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, { lower: true });
    let slug = baseSlug;
    let count = 1;
    
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    
    this.slug = slug;
  }
});

module.exports = mongoose.model("Product", productSchema);
