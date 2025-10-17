/**
 * 중앙화된 에러 핸들링 유틸리티
 */

const logger = require('../config/logger');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * 커스텀 에러 클래스
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 비즈니스 로직 에러
 */
class BusinessError extends AppError {
  constructor(message, errorCode = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode);
    this.name = 'BusinessError';
  }
}

/**
 * 인증/인가 에러
 */
class AuthError extends AppError {
  constructor(message, errorCode = null) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode);
    this.name = 'AuthError';
  }
}

/**
 * 리소스를 찾을 수 없음 에러
 */
class NotFoundError extends AppError {
  constructor(resource = '리소스') {
    super(`${resource}를 찾을 수 없습니다`, HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * 전역 에러 핸들러 미들웨어
 */
function globalErrorHandler(err, req, res, next) {
  // 에러 로깅
  logger.logError(
    err.message || '알 수 없는 에러 발생',
    err,
    {
      error_name: err.name,
      status_code: err.statusCode || 500,
      error_code: err.errorCode,
      is_operational: err.isOperational,
      path: req.path,
      method: req.method
    },
    req.context
  );

  // 운영 환경과 개발 환경에서 다른 응답
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    error: err.message || '서버 내부 오류가 발생했습니다',
    status_code: err.statusCode || 500
  };

  if (err.errorCode) {
    errorResponse.error_code = err.errorCode;
  }

  // 개발 환경에서는 스택 트레이스 포함
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      is_operational: err.isOperational
    };
  }

  res.status(err.statusCode || 500).json(errorResponse);
}

/**
 * 404 핸들러
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError('요청한 경로');

  logger.warn('존재하지 않는 경로 요청', {
    ...req.context,
    context: {
      path: req.path,
      method: req.method,
      ip: req.ip
    }
  });

  next(error);
}

/**
 * 비동기 라우트 핸들러 래퍼
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  BusinessError,
  AuthError,
  NotFoundError,
  globalErrorHandler,
  notFoundHandler,
  asyncHandler
};
