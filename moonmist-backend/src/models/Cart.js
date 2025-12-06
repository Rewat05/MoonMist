// src/models/Cart.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  qty: { type: Number, default: 1 },
  price: { type: Number, required: true }, // snapshot of product price at add time
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
