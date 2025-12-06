const Product = require("../models/Product");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const User = require("../models/User");

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    // require admin (extra safety, router also checks)
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { title, description, price, categories, attributes } = req.body;

    if (!title || price == null) {
      return res
        .status(400)
        .json({ message: "title and price are required" });
    }

    // req.files comes from multer + Cloudinary
    const imageUrls = (req.files || []).map((file) => file.path); // Cloudinary URL

    // categories parsing (array, JSON string, or comma separated)
    let parsedCategories = [];
    if (categories) {
      try {
        parsedCategories = Array.isArray(categories)
          ? categories
          : JSON.parse(categories);
      } catch {
        parsedCategories = String(categories)
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }
    }

    // attributes parsing (expect JSON string or object)
    let parsedAttributes = {};
    if (attributes) {
      if (typeof attributes === "object") {
        parsedAttributes = attributes;
      } else {
        try {
          parsedAttributes = JSON.parse(attributes);
        } catch {
          parsedAttributes = {};
        }
      }
    }

    const product = new Product({
      title,
      description,
      price,
      images: imageUrls,       // <-- Cloudinary URLs
      categories: parsedCategories,
      attributes: parsedAttributes,
    });

    await product.save();
    return res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);
    return res
      .status(500)
      .json({
        message: "Server error in creating product",
        error: err.message,
      });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // optional: add pagination / filters later
    const { page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (q) {
      // basic text search on title/description
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Product.countDocuments(filter);
    res.json({
      data: products,
      meta: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error("getAllProducts error:", err);
    res
      .status(500)
      .json({
        message: "Server error in getting all products",
        error: err.message,
      });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("getProduct error:", err);
    res
      .status(500)
      .json({
        message: "Server error in getting product",
        error: err.message,
      });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const { title, description, price, categories, attributes } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;

    // parse categories if provided
    if (categories !== undefined) {
      let parsedCategories = [];
      if (categories) {
        try {
          parsedCategories = Array.isArray(categories)
            ? categories
            : JSON.parse(categories);
        } catch {
          parsedCategories = String(categories)
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
        }
      }
      updates.categories = parsedCategories;
    }

    // parse attributes if provided
    if (attributes !== undefined) {
      let parsedAttributes = {};
      if (attributes) {
        if (typeof attributes === "object") {
          parsedAttributes = attributes;
        } else {
          try {
            parsedAttributes = JSON.parse(attributes);
          } catch {
            parsedAttributes = {};
          }
        }
      }
      updates.attributes = parsedAttributes;
    }

    // handle images (new upload from Cloudinary OR keep existing)
    const imageUrls = (req.files || []).map((file) => file.path);
    if (imageUrls.length > 0) {
      // overwrite with newly uploaded images
      updates.images = imageUrls;
    } else if (req.body.images !== undefined) {
      // allow sending existing images from frontend
      try {
        updates.images = Array.isArray(req.body.images)
          ? req.body.images
          : JSON.parse(req.body.images);
      } catch {
        updates.images = String(req.body.images)
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
      }
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("updateProduct error:", err);
    res
      .status(500)
      .json({
        message: "Server error in updating product",
        error: err.message,
      });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // only admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    // check if product exists first
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 1) delete the product itself
    // 2) remove it from all carts
    // 3) remove it from all users' favorites
    await Promise.all([
      Product.deleteOne({ _id: id }),
      Cart.updateMany(
        { "items.product": id },
        { $pull: { items: { product: id } } }
      ),
      User.updateMany({ favorites: id }, { $pull: { favorites: id } }),
    ]);

    return res.json({
      message: "Product deleted from catalog, all carts, and all favorites",
      id: product._id,
    });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({
      message: "Server error in deleting product",
      error: err.message,
    });
  }
};



// // src/controllers/productController.js
// const Product = require("../models/Product");
// const mongoose = require("mongoose");
// const Cart = require("../models/Cart");
// const User = require("../models/User");


// exports.createProduct = async (req, res) => {
//   try {
//     // require admin
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ message: "Admin only" });
//     }

//     const {
//       title,
//       description,
//       price,
//       images = [],
//       categories = [],
//       attributes = {},
//     } = req.body;
//     if (!title || price == null)
//       return res.status(400).json({ message: "title and price are required" });

//     const product = new Product({
//       title,
//       description,
//       price,
//       images,
//       categories,
//       attributes,
//     });
//     await product.save();
//     return res.status(201).json(product);
//   } catch (err) {
//     console.error("createProduct error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error in creating product", error: err.message });
//   }
// };

// exports.getAllProducts = async (req, res) => {
//   try {
//     // optional: add pagination / filters later
//     const { page = 1, limit = 20, q } = req.query;
//     const filter = {};
//     if (q) {
//       // basic text search on title/description
//       filter.$or = [
//         { title: { $regex: q, $options: "i" } },
//         { description: { $regex: q, $options: "i" } },
//       ];
//     }
//     const skip = (Number(page) - 1) * Number(limit);
//     const products = await Product.find(filter)
//       .skip(skip)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//     const total = await Product.countDocuments(filter);
//     res.json({
//       data: products,
//       meta: { total, page: Number(page), limit: Number(limit) },
//     });
//   } catch (err) {
//     console.error("getAllProducts error:", err);
//     res.status(500).json({ message: "Server error in getting all products", error: err.message });
//   }
// };

// exports.getProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const product = await Product.findById(id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     console.error("getProduct error:", err);
//     res.status(500).json({ message: "Server error in getting product", error: err.message });
//   }
// };

// exports.updateProduct = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ message: "Admin only" });
//     }

//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const updates = (({
//       title,
//       description,
//       price,
//       images,
//       categories,
//       attributes,
//     }) => ({ title, description, price, images, categories, attributes }))(
//       req.body
//     );

//     // remove undefined keys
//     Object.keys(updates).forEach(
//       (k) => updates[k] === undefined && delete updates[k]
//     );

//     const product = await Product.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     });
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     console.error("updateProduct error:", err);
//     res.status(500).json({ message: "Server error in updating product", error: err.message });
//   }
// };

// exports.deleteProduct = async (req, res) => {
//   try {
//     // only admin
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ message: "Admin only" });
//     }

//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid id" });
//     }

//     // check if product exists first
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // 1) delete the product itself
//     // 2) remove it from all carts
//     // 3) remove it from all users' favorites
//     await Promise.all([
//       Product.deleteOne({ _id: id }),
//       Cart.updateMany(
//         { "items.product": id },
//         { $pull: { items: { product: id } } }
//       ),
//       User.updateMany(
//         { favorites: id },
//         { $pull: { favorites: id } }
//       ),
//     ]);

//     return res.json({
//       message: "Product deleted from catalog, all carts, and all favorites",
//       id: product._id,
//     });
//   } catch (err) {
//     console.error("deleteProduct error:", err);
//     return res.status(500).json({
//       message: "Server error in deleting product",
//       error: err.message,
//     });
//   }
// };
