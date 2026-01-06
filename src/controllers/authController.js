const User = require("../models/User");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middlewares/asyncHandler");
const { generateToken } = require("../utils/jwt");

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already registerd", 400);
  }

  const user = await User.create({ name, email, password, role });

  user.password = undefined;

  const token = generateToken(user._id);

  res.status(201).json({ status: "success", data: { user }, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new AppError("incorrect email or password", 401);
  }
  const token = generateToken(user._id);

  res.status(200).json({ status: "success", data: user, token });
});

module.exports = {
  register,
  login,
};
