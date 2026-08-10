const mongoose = require("mongoose");
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
});

module.exports = mongoose.model("Category", categorySchema);
