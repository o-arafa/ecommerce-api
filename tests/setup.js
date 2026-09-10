const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

// Runs BEFORE every test file loads — so these are set before "../src/app" is required
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRE = "7d";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    binary: {
      systemBinary: "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe",
      version: "8.2.5",
    },
    replSet: { count: 1 },
  });
  await mongoose.connect(mongoServer.getUri("ecommerce-test"));
});

// Generic cleanup — works for every model without importing them here
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
