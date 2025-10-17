/**
 * CORS middleware configuration
 */
const logger = require('../config/logger');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://app.example.com'
];

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  } else if (origin) {
    logger.warn('CORS rejected', {
      ...req.context,
      context: { origin, allowed: allowedOrigins }
    });
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

module.exports = corsMiddleware;
