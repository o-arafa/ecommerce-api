const express = require("express");
const router = express.Router();

const { getMyCart, addToCart } = require("../controllers/cartController");
const { protect } = require("../middlewares/auth");

router.get("/", protect, getMyCart);
router.post("/", protect, addToCart);

module.exports = router;
