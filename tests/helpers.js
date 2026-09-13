const request = require("supertest");
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

const getUserToken = async (email = "buyer@test.com") => {
  await request(app).post("/api/auth/register").send({
    name: "Buyer",
    email,
    password: "password123",
    passwordConfirm: "password123",
  });
  const res = await request(app).post("/api/auth/login").send({
    email,
    password: "password123",
  });
  return res.body.token;
};

const createCategory = () =>
  Category.create({
    title: `Electronics_${Math.random()}`,
    description: "Electronic devices and accessories",
  });

const createProduct = async (adminToken, categoryId, overrides = {}) => {
  const res = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      title: "Wireless Mouse",
      description: "A comfortable wireless mouse with long battery life",
      price: 29.99,
      quantity: 100,
      category: String(categoryId),
      ...overrides,
    });
  return res.body.data;
};

const addToCart = (token, productId, quantity = 1) =>
  request(app)
    .post("/api/cart/add")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId: String(productId), quantity });

const shippingInformation = {
  phone: "0965656565",
  address: "Main Street 10",
  city: "Hama",
};

module.exports = {
  getAdminToken,
  getUserToken,
  createCategory,
  createProduct,
  addToCart,
  shippingInformation,
};
