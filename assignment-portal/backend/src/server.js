'use strict';

require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Attempt database connection (will fail gracefully if MONGODB_URI not set)
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[Server] Assignment Portal API running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log('[Server] MongoDB connection closed.');
        }
        console.log('[Server] Process terminated.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
