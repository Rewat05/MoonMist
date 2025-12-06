// src/routes/favoriteRouter.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");

// all favorites routes require login
router.use(auth);

// GET /api/favorites
router.get("/", getFavorites);

// POST /api/favorites
router.post("/", addFavorite);

// DELETE /api/favorites/:productId
router.delete("/:productId", removeFavorite);

module.exports = router;
