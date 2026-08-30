const User = require("../models/User");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwt");

const register = async ({name, email, password}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({ name, email, password });
  user.password = undefined;

  const token = generateToken(user._id);

  return { user, token };
};

const login = async ({email, password}) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  const token = generateToken(user._id);
  user.password = undefined;

  return { user, token };
};

module.exports = {
  register,
  login,
};