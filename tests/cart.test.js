const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Product = require("../src/models/Product");

const {
  getUserToken,
  createCategory,
  createProduct: createProductHelper,
  addToCart,
} = require("./helpers");

const createCustomProduct = async (overrides = {}) => {
  const category = await createCategory();

  return Product.create({
    title: "Wireless Mouse",
    description: "A comfortable wireless mouse",
    price: 25,
    category: category._id,
    inventory: { quantity: 10, reserved: 0 },
    ...overrides,
  });
};

describe("Cart API", () => {
  it("should return 401 without a token", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.statusCode).toBe(401);
  });

  it("should return an empty cart for a new user", async () => {
    const token = await getUserToken();
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.totalPrice).toBe(0);
  });

  describe("POST /api/cart/add", () => {
    it("should add a product and reserve stock", async () => {
      const token = await getUserToken();
      const product = await createCustomProduct();

      const res = await addToCart(token, product._id, 2);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Product added to cart successfully");
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].product).toBe(String(product._id));
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.totalPrice).toBe(50);

      const updated = await Product.findById(product._id);
      expect(updated.inventory.reserved).toBe(2);
    });

    it("should return 404 for a non-existent product", async () => {
      const token = await getUserToken();
      const res = await addToCart(token, new mongoose.Types.ObjectId(), 1);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Product not found");
    });

    it("should reject adding more than the available stock", async () => {
      const token = await getUserToken();
      const product = await createCustomProduct({
        inventory: { quantity: 5, reserved: 0 },
      });

      await addToCart(token, product._id, 4);

      const res = await addToCart(token, product._id, 2);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "Only 1 items available. You have 4 in cart.",
      );

      const unchanged = await Product.findById(product._id);
      expect(unchanged.inventory.reserved).toBe(4);
    });
  });

  describe("PUT /api/cart/:productId", () => {
    it("should update the quantity and recalculate the total", async () => {
      const token = await getUserToken();
      const product = await createCustomProduct();

      await addToCart(token, product._id, 2);

      const res = await request(app)
        .put(`/api/cart/${product._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Cart item updated successfully");
      expect(res.body.data.items[0].quantity).toBe(5);
      expect(res.body.data.totalPrice).toBe(125); // 25 x 5

      expect(res.body.data.items[0].product.title).toBe("Wireless Mouse");

      const updated = await Product.findById(product._id);
      expect(updated.inventory.reserved).toBe(5);
    });
  });

  describe("DELETE /api/cart/:productId", () => {
    it("should remove the item and release the reservation", async () => {
      const token = await getUserToken();
      const product = await createCustomProduct();

      await addToCart(token, product._id, 3);

      const res = await request(app)
        .delete(`/api/cart/${product._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Item removed from cart successfully");
      expect(res.body.data.items).toEqual([]);

      const updated = await Product.findById(product._id);
      expect(updated.inventory.reserved).toBe(0);
    });
  });

  describe("DELETE /api/cart/clear", () => {
    it("should empty the cart and release all reservations", async () => {
      const token = await getUserToken();
      const productA = await createCustomProduct();
      const productB = await createCustomProduct({
        title: "Keyboard",
        price: 50,
      });

      await addToCart(token, productA._id, 2);
      await addToCart(token, productB._id, 1);

      const res = await request(app)
        .delete("/api/cart/clear")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Cart cleared successfully");
      expect(res.body.data.items).toEqual([]);

      const a = await Product.findById(productA._id);
      const b = await Product.findById(productB._id);
      expect(a.inventory.reserved).toBe(0);
      expect(b.inventory.reserved).toBe(0);
    });
  });
});
