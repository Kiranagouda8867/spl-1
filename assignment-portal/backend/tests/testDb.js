'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Start an in-memory MongoDB instance for testing.
 * This ensures tests never connect to or modify a real database.
 */
async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
}

/**
 * Clear all collections between tests.
 */
async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Stop the in-memory MongoDB and close connection.
 */
async function teardownTestDB() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  delete process.env.MONGODB_URI;
}

module.exports = { setupTestDB, clearTestDB, teardownTestDB };
