// src/index.js
require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// 🔹 Enable CORS (put this BEFORE routes & before express.json if you want)
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Moonmist backend is running 🚀" });
});

// Load routes
const authRoutes = require("./routes/authRouter");
app.use("/api/auth", authRoutes);

const productRoutes = require("./routes/productRouter");
app.use("/api/products", productRoutes);

const favoriteRoutes = require("./routes/favoriteRouter");
app.use("/api/favorites", favoriteRoutes);

const cartRoutes = require("./routes/cartRouter");
app.use("/api/cart", cartRoutes);

// Connect DB + Start server
const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
