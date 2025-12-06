// src/routes/authRouter.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { register, login, me } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { register, login } = require("../controllers/authController");

// router.post("/register", register);
// router.post("/login", login);

// module.exports = router;