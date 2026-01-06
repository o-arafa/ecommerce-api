const asyncHandler = require("./asyncHandler");
const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Please login to access this resource", 401);
  }

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});

const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403
      );
    }
    next();
  });

module.exports = { protect, authorize };
