'use strict';

const express = require('express');
const router = express.Router();
const { isDBConnected } = require('../config/database');
const mongoose = require('mongoose');

/**
 * GET /api/health
 * Liveness probe — always returns 200 if the process is running.
 */
router.get('/', (_req, res) => {
  const dbConnected = isDBConnected();
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'assignment-portal-api',
    version: process.env.npm_package_version || '1.0.0',
    database: {
      connected: dbConnected,
      state: mongoose.connection.readyState,
      readyStateLabel: ['disconnected', 'connected', 'connecting', 'disconnecting'][
        mongoose.connection.readyState
      ] || 'unknown',
    },
    uptime: Math.floor(process.uptime()),
  };

  // Return 200 even if DB is not connected — liveness check
  res.status(200).json(status);
});

/**
 * GET /api/health/ready
 * Readiness probe — returns 503 if the database is not connected.
 */
router.get('/ready', (_req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      status: 'not_ready',
      message: 'Database not connected. Configure MONGODB_URI in backend/.env',
      timestamp: new Date().toISOString(),
    });
  }
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
