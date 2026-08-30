const asyncHandler = require("../middlewares/asyncHandler");
const authService = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, token } = await authService.register({ name, email, password });

  res.status(201).json({
    status: "success",
    data: { user },
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login({ email, password });

  res.status(200).json({
    status: "success",
    data: { user },
    token,
  });
});

module.exports = {
  register,
  login,
};
