/**
 * Winston 로거 설정
 * 통합 로그 포맷 명세에 따라 JSON 로그를 생성합니다.
 */

const winston = require('winston');
const os = require('os');

// 공통 필드 추가 포맷
const addCommonFields = winston.format((info) => {
  info.service = process.env.SERVICE_NAME || 'express-service';
  info.environment = process.env.ENVIRONMENT || 'development';
  info.host = os.hostname();

  // timestamp를 ISO 8601 UTC 형식으로
  if (!info.timestamp) {
    info.timestamp = new Date().toISOString();
  }

  // level을 대문자로 통일
  if (info.level) {
    info.level = info.level.toUpperCase();
  }

  return info;
});

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toISOString()
    }),
    winston.format.errors({ stack: true }),
    addCommonFields(),
    winston.format.json()
  ),
  defaultMeta: {},
  transports: [
    // Console 출력
    new winston.transports.Console({
      format: winston.format.json()
    }),

    // 파일 출력 (일반 로그)
    new winston.transports.File({
      filename: `${process.env.LOG_PATH || './logs'}/app.log`,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),

    // 파일 출력 (에러 로그만)
    new winston.transports.File({
      filename: `${process.env.LOG_PATH || './logs'}/error.log`,
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

/**
 * 쿼리 로그 생성 헬퍼
 */
logger.logQuery = function(queryType, statement, durationMs, rowsAffected, database, metadata = {}) {
  this.info('Database query executed', {
    ...metadata,
    query: {
      type: queryType,
      statement: statement,
      duration_ms: Math.round(durationMs * 100) / 100,
      rows_affected: rowsAffected,
      database: database
    }
  });
};

/**
 * 느린 쿼리 경고 로그 생성 헬퍼
 */
logger.logSlowQuery = function(queryType, statement, durationMs, rowsAffected, database, thresholdMs, metadata = {}) {
  this.warn('Slow database query detected', {
    ...metadata,
    query: {
      type: queryType,
      statement: statement,
      duration_ms: Math.round(durationMs * 100) / 100,
      rows_affected: rowsAffected,
      database: database
    },
    context: {
      threshold_ms: thresholdMs,
      warning: 'Query exceeded performance threshold'
    }
  });
};

/**
 * 에러 스택에서 위치 정보 추출
 */
function extractErrorLocation(error) {
  if (!error.stack) return null;

  // 스택 트레이스 파싱
  const stackLines = error.stack.split('\n');

  // 프로젝트 파일 찾기 (node_modules 제외)
  for (let i = 1; i < stackLines.length; i++) {
    const line = stackLines[i];

    // 파일 경로와 라인 번호 추출
    // 예: "at functionName (src/routes/users.js:45:10)"
    const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);

    if (match) {
      const [, functionName, filePath, lineNumber] = match;

      // node_modules가 아닌 프로젝트 파일인지 확인
      if (!filePath.includes('node_modules')) {
        // 프로젝트 루트 기준 상대 경로로 변환
        let relativePath = filePath;
        if (filePath.includes('/app/')) {
          relativePath = filePath.split('/app/')[1];
        } else if (filePath.includes('\\app\\')) {
          relativePath = filePath.split('\\app\\')[1];
        }

        return {
          file: relativePath,
          line: parseInt(lineNumber),
          function: functionName.trim()
        };
      }
    }

    // 익명 함수 또는 다른 형식 시도
    const simpleMatch = line.match(/at\s+(.+):(\d+):(\d+)/);
    if (simpleMatch) {
      const [, filePath, lineNumber] = simpleMatch;

      if (!filePath.includes('node_modules')) {
        let relativePath = filePath;
        if (filePath.includes('/app/')) {
          relativePath = filePath.split('/app/')[1];
        } else if (filePath.includes('\\app\\')) {
          relativePath = filePath.split('\\app\\')[1];
        }

        return {
          file: relativePath,
          line: parseInt(lineNumber),
          function: 'anonymous'
        };
      }
    }
  }

  return null;
}

/**
 * 에러 로그 생성 헬퍼
 */
logger.logError = function(message, error, context = {}, metadata = {}) {
  const errorData = {
    type: error.constructor.name,
    message: error.message,
    stack_trace: error.stack
  };

  // 에러 발생 위치 추출
  const location = extractErrorLocation(error);
  if (location) {
    errorData.location = location;
  }

  this.error(message, {
    ...metadata,
    error: errorData,
    context: context
  });
};

module.exports = logger;
