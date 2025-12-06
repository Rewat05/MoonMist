// src/controllers/favoriteController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

// GET /api/favorites
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("favorites")
      .populate(
        "favorites",
        "title description price images categories attributes createdAt"
      );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      data: user.favorites,
      meta: { total: user.favorites.length },
    });
  } catch (err) {
    console.error("getFavorites error:", err);
    return res
      .status(500)
      .json({
        message: "Server error in getting favorites",
        error: err.message,
      });
  }
};

// POST /api/favorites
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: productId } }, // no duplicates
      { new: true }
    ).populate(
      "favorites",
      "title description price images categories attributes createdAt"
    );

    return res.status(201).json({
      message: "Added to favorites",
      data: updatedUser.favorites,
      meta: { total: updatedUser.favorites.length },
    });
  } catch (err) {
    console.error("addFavorite error:", err);
    return res
      .status(500)
      .json({ message: "Server error in adding favorite", error: err.message });
  }
};

// DELETE /api/favorites/:productId
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: productId } },
      { new: true }
    ).populate(
      "favorites",
      "title description price images categories attributes createdAt"
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Removed from favorites",
      data: updatedUser.favorites,
      meta: { total: updatedUser.favorites.length },
    });
  } catch (err) {
    console.error("removeFavorite error:", err);
    return res
      .status(500)
      .json({
        message: "Server error in removing favorite",
        error: err.message,
      });
  }
};
