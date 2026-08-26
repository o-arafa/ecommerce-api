const stripe = require("../config/stripe");
const Order = require("../models/Order");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

const checkout = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized", 403);
  }

  if (order.status === "cancelled") {
    throw new AppError("Order cancelled", 400);
  }

  if (order.paymentStatus === "paid") {
    throw new AppError("Order already paid", 400);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100),
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.paymentIntentId = paymentIntent.id;
  await order.save();

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: order.totalPrice,
  });
});

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const order = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (order) {
        order.paymentStatus = "paid";
        order.status = "processing";
        await order.save();
        console.log(`Order ${order._id} updated to paid`);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      const order = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (order) {
        order.paymentStatus = "failed";
        await order.save();
        console.log(`Order ${order._id} failed`);
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Error processing webhook:", error.message);
    return res.status(500).json({ received: false });
  }
};

module.exports = {
  checkout,
  stripeWebhook,
};