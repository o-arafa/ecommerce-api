const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/auth.schema");
const { authLimiter } = require("../middlewares/rateLimiter");
const router = express.Router();

const loginRateLimiter =
  process.env.NODE_ENV === "test" ? (req, res, next) => next() : authLimiter;

router.post("/register", validate(registerSchema), authController.register);
router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);

module.exports = router;
