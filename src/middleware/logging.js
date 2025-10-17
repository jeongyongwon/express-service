/**
 * HTTP 요청/응답 로깅 미들웨어
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * 로깅 미들웨어
 * 모든 HTTP 요청/응답을 통합 로그 포맷으로 기록합니다.
 */
function loggingMiddleware(req, res, next) {
  const startTime = Date.now();

  // Trace ID 생성 또는 헤더에서 가져오기
  const traceId = req.headers['x-trace-id'] || uuidv4();
  const spanId = uuidv4();
  const requestId = uuidv4();

  // 요청 객체에 컨텍스트 정보 저장
  req.context = {
    trace_id: traceId,
    span_id: spanId,
    request_id: requestId
  };

  // 클라이언트 IP 추출
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.socket.remoteAddress;

  // 요청 시작 로그
  logger.info('HTTP request started', {
    ...req.context,
    http: {
      method: req.method,
      path: req.path,
      client_ip: clientIp,
      user_agent: req.headers['user-agent']
    }
  });

  // 응답 완료 시 로그 기록
  const originalSend = res.send;
  res.send = function(data) {
    const durationMs = Date.now() - startTime;

    // 응답 로그
    logger.info('HTTP request completed', {
      ...req.context,
      http: {
        method: req.method,
        path: req.path,
        status_code: res.statusCode,
        duration_ms: durationMs,
        client_ip: clientIp,
        user_agent: req.headers['user-agent']
      }
    });

    return originalSend.call(this, data);
  };

  // 에러 발생 시 로그 기록
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const durationMs = Date.now() - startTime;

      logger.error('HTTP request failed', {
        ...req.context,
        http: {
          method: req.method,
          path: req.path,
          status_code: res.statusCode,
          duration_ms: durationMs,
          client_ip: clientIp,
          user_agent: req.headers['user-agent']
        }
      });
    }
  });

  next();
}

module.exports = loggingMiddleware;
