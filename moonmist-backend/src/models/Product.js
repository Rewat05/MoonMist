// src/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [String],
    categories: [String],
    attributes: mongoose.Schema.Types.Mixed // flexible object for size/color etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
