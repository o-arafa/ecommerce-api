const request = require("supertest");
const app = require("../src/app");

describe("Auth API", () => {
  const validUser = {
    name: "Obeida",
    email: "obeida@test.com",
    password: "password123",
    passwordConfirm: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should create a new user and return a token", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.token).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.password).toBeUndefined(); // password should never be returned
    });

    it("should reject a duplicate email with 409", async () => {
      await request(app).post("/api/auth/register").send(validUser);

      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe("Email already registered");
    });

    it("should reject invalid data with 400 (Zod validation)", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "A",
        email: "not-an-email",
        password: "short",
        passwordConfirm: "diff",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.errors).toBeDefined();
    });

    it("should reject when password and passwordConfirm do not match", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, passwordConfirm: "different123" });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
    });

    it("should log in successfully and return a token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should reject an incorrect password with 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "wrongpassword" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Incorrect email or password");
    });

    it("should reject a non-existing email with 401", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "doesnotexist@example.com",
        password: validUser.password,
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Incorrect email or password");
    });
  });
});
