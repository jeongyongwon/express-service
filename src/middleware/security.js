/**
 * 보안 관련 미들웨어
 */

const logger = require('../config/logger');

/**
 * 보안 헤더 추가 미들웨어
 */
function securityHeaders(req, res, next) {
  // XSS 공격 방지
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HSTS (HTTPS 강제)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );

  next();
}

/**
 * IP 화이트리스트 검증 미들웨어
 */
function ipWhitelist(allowedIps = []) {
  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      logger.warn('허용되지 않은 IP 접근 시도', {
        ...req.context,
        context: {
          client_ip: clientIp,
          allowed_ips: allowedIps,
          path: req.path
        }
      });

      return res.status(403).json({
        error: '접근이 거부되었습니다',
        reason: 'IP 주소가 화이트리스트에 없습니다'
      });
    }

    next();
  };
}

/**
 * API 키 검증 미들웨어
 */
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'default-api-key';

  if (!apiKey) {
    logger.warn('API 키 누락', {
      ...req.context,
      context: { path: req.path, method: req.method }
    });

    return res.status(401).json({
      error: 'API 키가 필요합니다',
      header: 'X-API-Key'
    });
  }

  if (apiKey !== validApiKey) {
    logger.warn('잘못된 API 키', {
      ...req.context,
      context: {
        provided_key: apiKey.substring(0, 10) + '...',
        path: req.path
      }
    });

    return res.status(403).json({
      error: 'API 키가 유효하지 않습니다'
    });
  }

  next();
}

/**
 * 요청 본문 크기 제한 검증
 */
function requestSizeLimit(maxSizeBytes = 1024 * 1024) { // 기본 1MB
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];

    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      logger.warn('요청 본문 크기 초과', {
        ...req.context,
        context: {
          content_length: parseInt(contentLength),
          max_size_bytes: maxSizeBytes,
          max_size_mb: (maxSizeBytes / (1024 * 1024)).toFixed(2)
        }
      });

      return res.status(413).json({
        error: '요청 본문이 너무 큽니다',
        max_size_mb: (maxSizeBytes / (1024 * 1024)).toFixed(2)
      });
    }

    next();
  };
}

module.exports = {
  securityHeaders,
  ipWhitelist,
  validateApiKey,
  requestSizeLimit
};
