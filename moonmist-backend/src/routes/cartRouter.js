// src/routes/cartRouter.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  removeFromCart,
} = require("../controllers/cartController");

// all cart routes require login
router.use(auth);

// GET /api/cart
router.get("/", getCart);

// POST /api/cart
router.post("/", addToCart);

// DELETE /api/cart/:productId
router.delete("/:productId", removeFromCart);

module.exports = router;
