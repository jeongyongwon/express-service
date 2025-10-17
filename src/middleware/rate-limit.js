/**
 * Simple rate limiting middleware
 */
const logger = require('../config/logger');

class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const clientIp = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      // Clean up old entries
      for (const [ip, data] of this.requests.entries()) {
        if (now - data.windowStart > this.windowMs) {
          this.requests.delete(ip);
        }
      }

      // Get current client data
      let clientData = this.requests.get(clientIp);

      if (!clientData) {
        clientData = {
          windowStart: now,
          count: 0
        };
        this.requests.set(clientIp, clientData);
      }

      // Reset window if needed
      if (now - clientData.windowStart > this.windowMs) {
        clientData.windowStart = now;
        clientData.count = 0;
      }

      // Increment counter
      clientData.count++;

      // Check limit
      if (clientData.count > this.maxRequests) {
        logger.warn('Rate limit exceeded', {
          ...req.context,
          context: {
            client_ip: clientIp,
            request_count: clientData.count,
            limit: this.maxRequests,
            window_ms: this.windowMs
          }
        });

        return res.status(429).json({
          error: 'Too many requests',
          retry_after: Math.ceil((clientData.windowStart + this.windowMs - now) / 1000)
        });
      }

      next();
    };
  }

  getStats() {
    return {
      tracked_ips: this.requests.size,
      window_ms: this.windowMs,
      max_requests: this.maxRequests
    };
  }
}

module.exports = RateLimiter;
