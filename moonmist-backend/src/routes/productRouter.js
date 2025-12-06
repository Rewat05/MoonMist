// src/routes/productRouter.js
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const auth = require('../middleware/authMiddleware');
const upload = require("../middleware/uploadMiddleware");

// Public
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);

// Protected (admin)
// router.post("/", auth, productController.createProduct);
// router.put("/:id", auth, productController.updateProduct);
// router.delete("/:id", auth, productController.deleteProduct);

router.post(
  "/",
  auth,        // user must be logged in
  upload.array("images", 5), // <-- upload up to 5 images to Cloudinary
  productController.createProduct
);

router.put(
  "/:id",
  auth,
  productController.updateProduct
);

router.delete(
  "/:id",
  auth,
  productController.deleteProduct
);

module.exports = router;
