const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const Category = require("../src/models/Category");

const getAdminToken = async () => {
  await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
  });
  const res = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "password123",
  });
  return res.body.token;
};

const getUserToken = async () => {
  await request(app).post("/api/auth/register").send({
    name: "Buyer",
    email: "buyer@test.com",
    password: "password123",
    passwordConfirm: "password123",
  });
  const res = await request(app).post("/api/auth/login").send({
    email: "buyer@test.com",
    password: "password123",
  });
  return res.body.token;
};

const createCategory = () =>
  Category.create({
    title: "Electronics",
    description: "Electronic devices and accessories",
  });

const validProduct = (categoryId) => ({
  title: "Wireless Mouse",
  description: "A comfortable wireless mouse with long battery life",
  price: 29.99,
  quantity: 100,
  category: String(categoryId),
});

describe("Products API", () => {
  describe("GET /api/products", () => {
    it("should return a paginated list of products", async () => {
      const token = await getAdminToken();
      const category = await createCategory();
      await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(category._id));

      const res = await request(app).get("/api/products");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
      expect(res.body.pagination.currentPage).toBe(1);
    });

    it("should support searching by title", async () => {
      const token = await getAdminToken();
      const category = await createCategory();
      await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(category._id));
      await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...validProduct(category._id),
          title: "Mechanical Keyboard",
        });

      const res = await request(app).get("/api/products?search=keyboard");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Mechanical Keyboard");
    });
  });

  describe("GET /api/products/:productId", () => {
    it("should return 404 for a non-existent product", async () => {
      const res = await request(app).get(
        `/api/products/${new mongoose.Types.ObjectId()}`,
      );
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Product not found");
    });

    it("should find a product by id and by slug", async () => {
      const token = await getAdminToken();
      const category = await createCategory();
      const created = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(category._id));
      const productId = created.body.data._id;

      const byId = await request(app).get(`/api/products/${productId}`);
      expect(byId.statusCode).toBe(200);
      expect(byId.body.data.title).toBe("Wireless Mouse");

      const bySlug = await request(app).get("/api/products/wireless-mouse");
      expect(bySlug.statusCode).toBe(200);
      expect(bySlug.body.data._id).toBe(productId);
    });
  });

  describe("POST /api/products", () => {
    it("should return 401 without a token", async () => {
      const category = await createCategory();
      const res = await request(app)
        .post("/api/products")
        .send(validProduct(category._id));

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Please login to access this resource");
    });

    it("should return 403 for a non-admin user", async () => {
      const token = await getUserToken();
      const category = await createCategory();
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(category._id));

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to perform this action",
      );
    });

    it("should return 404 when the category does not exist", async () => {
      const token = await getAdminToken();
      const fakeCategoryId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(fakeCategoryId));

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("The selected category does not exist");
    });

    it("should create a product as admin with 201", async () => {
      const token = await getAdminToken();
      const category = await createCategory();
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(category._id));

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Product created successfully");
      expect(res.body.data.slug).toBe("wireless-mouse");
      expect(res.body.data.inventory.quantity).toBe(100);
      expect(res.body.data.category).toBe(String(category._id));
    });

    it("should return 400 for invalid data (Zod)", async () => {
      const token = await getAdminToken();
      const category = await createCategory();
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "A",
          description: "short",
          price: -5,
          quantity: 10,
          category: String(category._id),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("fail");
    });
  });

  describe("PATCH /api/products/:productId", () => {
    it("should update a product as admin", async () => {
      const token = await getAdminToken();
      const category = await createCategory();
      const created = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(category._id));
      const productId = created.body.data._id;

      const res = await request(app)
        .patch(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 19.99 });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Product updated successfully");
      expect(res.body.data.price).toBe(19.99);
    });

    it("should return 403 for a non-admin user", async () => {
      const adminToken = await getAdminToken();
      const userToken = await getUserToken();
      const category = await createCategory();
      const created = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProduct(category._id));

      const res = await request(app)
        .patch(`/api/products/${created.body.data._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: 1 });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/products/:productId", () => {
    it("should delete a product as admin and return 404 afterwards", async () => {
      const token = await getAdminToken();
      const category = await createCategory();
      const created = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(validProduct(category._id));
      const productId = created.body.data._id;

      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Product deleted successfully");

      const after = await request(app).get(`/api/products/${productId}`);
      expect(after.statusCode).toBe(404);
    });
  });
});
