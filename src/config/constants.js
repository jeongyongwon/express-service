/**
 * 애플리케이션 상수 정의
 */

module.exports = {
  // HTTP 상태 코드
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // 에러 메시지
  ERROR_MESSAGES: {
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다',
    INVALID_USER_ID: '유효하지 않은 사용자 ID입니다',
    MISSING_REQUIRED_FIELDS: '필수 입력 항목이 누락되었습니다',
    INVALID_EMAIL: '이메일 형식이 올바르지 않습니다',
    DB_CONNECTION_FAILED: '데이터베이스 연결에 실패했습니다',
    REDIS_CONNECTION_FAILED: 'Redis 연결에 실패했습니다'
  },

  // 유효성 검사 규칙
  VALIDATION: {
    EMAIL_MAX_LENGTH: 254,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    USER_ID_MAX: 1000000
  },

  // 타임아웃 설정 (밀리초)
  TIMEOUTS: {
    DB_QUERY: 5000,
    REDIS_OPERATION: 2000,
    EXTERNAL_API: 10000
  },

  // 캐시 TTL (초)
  CACHE_TTL: {
    USER_DATA: 60,
    HEALTH_CHECK: 30,
    METRICS: 10
  }
};
