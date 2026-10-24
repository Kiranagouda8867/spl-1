'use strict';

const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB using MONGODB_URI from environment.
 * Fails clearly if the URL is missing or invalid.
 * Never prints credentials to logs.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '[Database] WARNING: MONGODB_URI is not configured.\n' +
      '[Database] Database-dependent features will be unavailable.\n' +
      '[Database] To enable the database:\n' +
      '[Database]   1. Copy .env.example to backend/.env\n' +
      '[Database]   2. Set MONGODB_URI to your MongoDB connection string\n' +
      '[Database]   3. Restart the server\n' +
      '[Database] See docs/ARCHITECTURE.md for MongoDB Compass connection guide.'
    );
    return;
  }

  if (isConnected) {
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  };

  try {
    await mongoose.connect(uri, options);
    isConnected = true;

    // Log connection without exposing credentials
    const safeHost = getSafeHost(uri);
    console.log(`[Database] Connected to MongoDB: ${safeHost}`);

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[Database] MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[Database] MongoDB reconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });
  } catch (err) {
    console.error('[Database] Failed to connect to MongoDB:', err.message);
    console.error(
      '[Database] Please verify your MONGODB_URI in backend/.env\n' +
      '[Database] Ensure MongoDB is running and the URI format is correct.\n' +
      '[Database] Do NOT share your connection string publicly.'
    );
    // Don't exit — allow health endpoint and static functionality to remain available
  }
}

/**
 * Return whether the database is currently connected.
 */
function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Strip credentials from a MongoDB URI for safe logging.
 */
function getSafeHost(uri) {
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.hostname}:${url.port || 27017}${url.pathname}`;
  } catch {
    return '[invalid URI format]';
  }
}

module.exports = { connectDB, isDBConnected };
