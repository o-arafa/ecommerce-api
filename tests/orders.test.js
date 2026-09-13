const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Product = require("../src/models/Product");
const Cart = require("../src/models/Cart");
const Order = require("../src/models/Order");
const {
  getAdminToken,
  getUserToken,
  createCategory,
  createProduct,
  addToCart,
  shippingInformation,
} = require("./helpers");

const createOrder = (token, overrides = {}) =>
  request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({ shippingInformation, ...overrides });

const seedCart = async (quantity = 1, productOverrides = {}) => {
  const adminToken = await getAdminToken();
  const token = await getUserToken();
  const category = await createCategory();
  const product = await createProduct(
    adminToken,
    category._id,
    productOverrides,
  );
  await addToCart(token, product._id, quantity);
  return {
    adminToken,
    token,
    productId: product._id,
    categoryId: category._id,
  };
};

describe("Orders API", () => {
  describe("POST /api/orders", () => {
    it("should return 401 without a token", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ shippingInformation });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return 400 when shipping information is incomplete", async () => {
      const { token } = await seedCart();
      const res = await createOrder(token, {
        shippingInformation: { phone: "12345678" },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("fail");
    });

    it("should return 400 when the cart is empty", async () => {
      const token = await getUserToken();

      const res = await createOrder(token);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Cart is empty");
    });

    it("should create an order, decrease stock, and delete the cart", async () => {
      const { token, productId } = await seedCart(2);

      const res = await createOrder(token, { shippingPrice: 10 });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Order created successfully");

      const order = res.body.data;
      expect(order.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);
      expect(order.status).toBe("pending");
      expect(order.totalPrice).toBeCloseTo(29.99 * 2 + 10, 2);

      const product = await Product.findById(productId);
      expect(product.inventory.quantity).toBe(98);
      expect(product.inventory.reserved).toBe(0);

      const cart = await Cart.findOne({ user: order.user });
      expect(cart).toBeNull();
    });

    it("should return 400 when there is not enough stock", async () => {
      const { token, productId } = await seedCart(1, { quantity: 1 });

      await Product.findByIdAndUpdate(productId, {
        "inventory.quantity": 0,
      });

      const res = await createOrder(token);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Not enough stock");

      expect(await Order.countDocuments()).toBe(0);
    });

    it("should rollback everything when order creation fails mid-transaction", async () => {
      const { token, productId } = await seedCart(1);

      await Product.findByIdAndDelete(productId);

      const res = await createOrder(token);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Product not found");

      // Transaction aborted: no order created AND the cart was not deleted
      expect(await Order.countDocuments()).toBe(0);
      const cart = await Cart.findOne();
      expect(cart.items).toHaveLength(1);
    });
  });

  describe("GET /api/orders/:orderId", () => {
    it("should let the owner view their order", async () => {
      const { token } = await seedCart(1);
      const created = await createOrder(token);

      const res = await request(app)
        .get(`/api/orders/${created.body.data._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(created.body.data._id);
    });

    it("should let an admin view any order", async () => {
      const { adminToken, token } = await seedCart(1);
      const created = await createOrder(token);

      const res = await request(app)
        .get(`/api/orders/${created.body.data._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });

    it("should return 403 when another buyer tries to view the order", async () => {
      const { token } = await seedCart(1);
      const otherToken = await getUserToken("other@test.com");
      const created = await createOrder(token);

      const res = await request(app)
        .get(`/api/orders/${created.body.data._id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Not authorized to view this order");
    });

    it("should return 404 for a non-existent order", async () => {
      const token = await getUserToken();

      const res = await request(app)
        .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Order not found");
    });
  });

  describe("GET /api/orders/all and /my-orders", () => {
    it("should return 403 for a non-admin on /all", async () => {
      const token = await getUserToken();

      const res = await request(app)
        .get("/api/orders/all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return all orders for admin and only own orders for the buyer", async () => {
      const { adminToken, token, categoryId } = await seedCart(1);
      await createOrder(token);

      const otherToken = await getUserToken("other@test.com");
      const product = await createProduct(adminToken, categoryId);
      await addToCart(otherToken, product._id, 1);
      await createOrder(otherToken);

      const all = await request(app)
        .get("/api/orders/all")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(all.statusCode).toBe(200);
      expect(all.body.data).toHaveLength(2);

      const mine = await request(app)
        .get("/api/orders/my-orders")
        .set("Authorization", `Bearer ${token}`);
      expect(mine.statusCode).toBe(200);
      expect(mine.body.data).toHaveLength(1);
    });
  });

  describe("PATCH /api/orders/:orderId/status", () => {
    it("should follow the allowed transitions", async () => {
      const { adminToken, token } = await seedCart(1);
      const created = await createOrder(token);
      const orderId = created.body.data._id;

      for (const status of ["processing", "shipped", "delivered"]) {
        const res = await request(app)
          .put(`/api/orders/${orderId}/status`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ status });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe(`Order status updated to ${status}`);
      }
    });

    it("should reject forbidden transitions with 400", async () => {
      const { adminToken, token } = await seedCart(1);
      const created = await createOrder(token);
      const orderId = created.body.data._id;

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "delivered" }); // pending → delivered is not allowed

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Cannot change from "pending" to "delivered"',
      );
    });
  });

  describe("PUT /api/orders/:id/cancel", () => {
    it("should cancel a pending order and restore the stock", async () => {
      const { token, productId } = await seedCart(2);
      const created = await createOrder(token);

      const res = await request(app)
        .put(`/api/orders/${created.body.data._id}/cancel`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Order cancelled successfully");
      expect(res.body.data.status).toBe("cancelled");

      const product = await Product.findById(productId);
      expect(product.inventory.quantity).toBe(100);
      expect(product.inventory.reserved).toBe(0);
    });

    it("should return 403 when a non-owner tries to cancel", async () => {
      const { token } = await seedCart(1);
      const otherToken = await getUserToken("other@test.com");
      const created = await createOrder(token);

      const res = await request(app)
        .put(`/api/orders/${created.body.data._id}/cancel`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 400 when cancelling a non-pending order", async () => {
      const { adminToken, token } = await seedCart(1);
      const created = await createOrder(token);
      const orderId = created.body.data._id;

      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "processing" });

      const res = await request(app)
        .put(`/api/orders/${orderId}/cancel`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Cannot cancel order");
    });
  });
});
