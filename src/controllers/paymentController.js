const stripe = require("../config/stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
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
      process.env.STRIPE_WEBHOOK_SECRET,
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
      }).populate("items.product");

      if (!order) {
        return res.json({ received: true });
      }

      order.paymentStatus = "paid";
      order.status = "processing";
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { quantity: -item.quantity },
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

module.exports = {
  createPaymentIntent,
  stripeWebhook,
};
