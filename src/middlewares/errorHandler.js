const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error.name === "CastError") {
    error = new AppError("Invalid input format", 400);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((el) => el.message)
      .join(", ");
    error = new AppError(message, 400);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    error = new AppError(`${field} already exists`, 409);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";
  const message = error.message || "Something went wrong";

  const response = {
    success: false,
    status,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
