/**
 * Health check routes
 */
const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

router.get('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      response_time_ms: Date.now() - startTime
    };

    logger.info('Health check performed', {
      ...req.context,
      context: { status: health.status, uptime: health.uptime }
    });

    res.json(health);
  } catch (error) {
    logger.logError('Health check failed', error, {}, req.context);
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

module.exports = router;
