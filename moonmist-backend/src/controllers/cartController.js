// src/controllers/cartController.js
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "title price images categories attributes"
    );

    if (!cart) {
      return res.json({ items: [], meta: { totalItems: 0 } });
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);

    return res.json({
      items: cart.items,
      meta: { totalItems },
    });
  } catch (err) {
    console.error("getCart error:", err);
    return res
      .status(500)
      .json({ message: "Server error in getting cart", error: err.message });
  }
};

// POST /api/cart  { productId, qty }
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let { productId, qty } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    qty = Number(qty) || 1;
    if (qty <= 0) {
      return res.status(400).json({ message: "qty must be > 0" });
    }

    const product = await Product.findById(productId).select("price");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty; // increment quantity
      existingItem.price = product.price; // refresh price snapshot if needed
    } else {
      cart.items.push({
        product: productId,
        qty,
        price: product.price,
      });
    }

    await cart.save();

    const populatedCart = await cart.populate(
      "items.product",
      "title price images categories attributes"
    );

    const totalItems = populatedCart.items.reduce(
      (sum, item) => sum + item.qty,
      0
    );

    return res.status(201).json({
      message: "Item added to cart",
      items: populatedCart.items,
      meta: { totalItems },
    });
  } catch (err) {
    console.error("addToCart error:", err);
    return res
      .status(500)
      .json({ message: "Server error in adding to cart", error: err.message });
  }
};

// DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.json({ message: "Cart is already empty", items: [], meta: { totalItems: 0 } });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      // product wasn't in cart, but respond idempotently
      const populatedCart = await cart.populate(
        "items.product",
        "title price images categories attributes"
      );
      const totalItems = populatedCart.items.reduce(
        (sum, item) => sum + item.qty,
        0
      );

      return res.json({
        message: "Item was not in cart",
        items: populatedCart.items,
        meta: { totalItems },
      });
    }

    await cart.save();

    const populatedCart = await cart.populate(
      "items.product",
      "title price images categories attributes"
    );
    const totalItems = populatedCart.items.reduce(
      (sum, item) => sum + item.qty,
      0
    );

    return res.json({
      message: "Item removed from cart",
      items: populatedCart.items,
      meta: { totalItems },
    });
  } catch (err) {
    console.error("removeFromCart error:", err);
    return res
      .status(500)
      .json({ message: "Server error in removing from cart", error: err.message });
  }
};
