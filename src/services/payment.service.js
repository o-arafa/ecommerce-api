const stripe = require("../config/stripe");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");

const checkout = async (userId, orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.user.toString() !== userId.toString()) {
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
      userId: userId.toString(),
    },
  });

  order.paymentIntentId = paymentIntent.id;

  await order.save();

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: order.totalPrice,
  };
};

const handleStripeWebhook = async (rawBody, signature) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    throw new AppError(
      `Webhook signature verification failed: ${error.message}`,
      400,
    );
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
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

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;

      const order = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (order) {
        order.paymentStatus = "failed";

        await order.save();

        console.log(`Order ${order._id} payment failed`);
      }

      break;
    }

    default:
      break;
  }

  return true;
};

module.exports = {
  checkout,
  handleStripeWebhook,
};
