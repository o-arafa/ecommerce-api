const asyncHandler = require("../middlewares/asyncHandler");
const paymentService = require("../services/payment.service");

const checkout = asyncHandler(async (req, res) => {
  const result = await paymentService.checkout(req.user._id, req.body.orderId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const stripeWebhook = async (req, res) => {
  try {
    await paymentService.handleStripeWebhook(
      req.body,
      req.headers["stripe-signature"],
    );

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Webhook processing failed",
    });
  }
};

module.exports = {
  checkout,
  stripeWebhook,
};
