/**
 * 사용자 API 라우트
 * 통합 로그 포맷을 사용한 로깅 예시를 포함합니다.
 */

const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// 임시 데이터베이스 (메모리)
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

/**
 * GET /users/:id - 사용자 조회
 */
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  const userId = parseInt(req.params.id);

  // Validation: user_id must be a valid positive integer
  if (isNaN(userId) || userId <= 0) {
    logger.warn('Invalid user ID provided', {
      ...req.context,
      context: { user_id: req.params.id, parsed_id: userId }
    });
    return res.status(400).json({ error: 'Invalid user ID, must be positive integer' });
  }

  try {
    // 쿼리 시뮬레이션 (45ms)
    await new Promise(resolve => setTimeout(resolve, 45));

    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const durationMs = Date.now() - startTime;

    // 쿼리 로그
    logger.logQuery(
      'SELECT',
      'SELECT * FROM users WHERE id = ?',
      durationMs,
      1,
      'user_db',
      {
        ...req.context,
        context: { user_id: userId }
      }
    );

    res.json(user);

  } catch (error) {
    const durationMs = Date.now() - startTime;

    // 에러 로그
    logger.logError(
      'Failed to get user',
      error,
      { user_id: userId, operation: 'get_user' },
      req.context
    );

    res.status(404).json({ error: 'User not found' });
  }
});

/**
 * POST /users - 사용자 생성
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('Invalid email format', {
        ...req.context,
        context: { email, validation: 'email_format' }
      });
      throw new Error('Invalid email format');
    }

    // INSERT 시뮬레이션 (32ms)
    await new Promise(resolve => setTimeout(resolve, 32));

    const newUser = {
      id: users.length + 1,
      name,
      email
    };

    users.push(newUser);

    const durationMs = Date.now() - startTime;

    // 쿼리 로그
    logger.logQuery(
      'INSERT',
      'INSERT INTO users (name, email) VALUES (?, ?)',
      durationMs,
      1,
      'user_db',
      req.context
    );

    res.status(201).json(newUser);

  } catch (error) {
    // 에러 로그
    logger.logError(
      'Failed to create user',
      error,
      { user_data: req.body, operation: 'create_user' },
      req.context
    );

    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /error - 에러 테스트
 */
router.get('/test/error', (req, res) => {
  try {
    // 의도적으로 에러 발생
    performJsonParsing('invalid json');
    res.json({ result: 'success' });

  } catch (error) {
    // 에러 로그 (스택 트레이스 및 위치 정보 포함)
    logger.logError(
      'JSON parsing error occurred',
      error,
      { operation: 'parse_json', endpoint: '/error' },
      req.context
    );

    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 에러 발생 위치를 명확히 하기 위한 헬퍼 함수
 */
function performJsonParsing(jsonString) {
  return JSON.parse(jsonString);  // 이 라인에서 SyntaxError 발생
}

/**
 * GET /slow-query - 느린 쿼리 테스트
 */
router.get('/test/slow-query', async (req, res) => {
  const startTime = Date.now();

  try {
    // 느린 쿼리 시뮬레이션 (2.5초)
    await new Promise(resolve => setTimeout(resolve, 800));

    const durationMs = Date.now() - startTime;

    // 느린 쿼리 경고 로그
    logger.logSlowQuery(
      'SELECT',
      'SELECT * FROM large_table WHERE complex_condition = ?',
      durationMs,
      1000,
      'analytics_db',
      1000,
      req.context
    );

    res.json({
      status: 'completed',
      warning: 'Query was slow'
    });

  } catch (error) {
    logger.logError('Slow query test failed', error, {}, req.context);
    res.status(500).json({ error: 'Test failed' });
  }
});

// ============================================================
// 다양한 에러 시나리오 (RAG 테스트용)
// ============================================================

/**
 * GET /test/null-pointer - Null Reference Error
 */
router.get('/test/null-pointer', (req, res) => {
  try {
    const user = null;
    const userName = user.name; // TypeError 발생

    res.json({ name: userName });
  } catch (error) {
    logger.logError(
      'Null pointer exception occurred',
      error,
      {
        operation: 'access_property',
        endpoint: '/test/null-pointer',
        attempted_access: 'user.name'
      },
      req.context
    );
    res.status(500).json({ error: 'Cannot read property of null' });
  }
});

/**
 * GET /test/undefined-error - Undefined Variable Error (유사 시나리오 1)
 */
router.get('/test/undefined-error', (req, res) => {
  try {
    let obj = { data: { value: 123 } };
    obj = undefined;
    const result = obj.data.value; // TypeError 발생

    res.json({ result });
  } catch (error) {
    logger.logError(
      'Undefined variable access error',
      error,
      {
        operation: 'read_nested_property',
        endpoint: '/test/undefined-error',
        attempted_access: 'obj.data.value'
      },
      req.context
    );
    res.status(500).json({ error: 'Cannot access property of undefined' });
  }
});

/**
 * GET /test/array-out-of-bounds - Array Index Out of Bounds
 */
router.get('/test/array-out-of-bounds', (req, res) => {
  try {
    const items = ['a', 'b', 'c'];
    const item = items[10]; // undefined

    if (!item) {
      throw new Error('Array index out of bounds: attempted to access index 10 of array with length 3');
    }

    res.json({ item });
  } catch (error) {
    logger.logError(
      'Array index out of bounds error',
      error,
      {
        operation: 'array_access',
        endpoint: '/test/array-out-of-bounds',
        array_length: 3,
        attempted_index: 10
      },
      req.context
    );
    res.status(500).json({ error: 'Array index error' });
  }
});

/**
 * GET /test/db-connection-timeout - Database Connection Timeout
 */
router.get('/test/db-connection-timeout', async (req, res) => {
  const startTime = Date.now();

  try {
    // DB 연결 시도 시뮬레이션
    await simulateDbConnectionTimeout();

    res.json({ status: 'connected' });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.logError(
      'Database connection timeout',
      error,
      {
        operation: 'db_connect',
        endpoint: '/test/db-connection-timeout',
        database: 'postgresql',
        host: 'localhost',
        port: 5432,
        timeout_ms: 5000,
        duration_ms: durationMs
      },
      req.context
    );
    res.status(503).json({ error: 'Database connection timeout' });
  }
});

async function simulateDbConnectionTimeout() {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Connection timeout: Unable to connect to database after 5000ms'));
    }, 100);
  });
}

/**
 * GET /test/db-connection-refused - Database Connection Refused (유사 시나리오 2)
 */
router.get('/test/db-connection-refused', async (req, res) => {
  try {
    throw new Error('Connection refused: ECONNREFUSED 127.0.0.1:5432');
  } catch (error) {
    logger.logError(
      'Database connection refused',
      error,
      {
        operation: 'db_connect',
        endpoint: '/test/db-connection-refused',
        database: 'postgresql',
        host: '127.0.0.1',
        port: 5432,
        error_code: 'ECONNREFUSED'
      },
      req.context
    );
    res.status(503).json({ error: 'Database connection refused' });
  }
});

/**
 * GET /test/redis-connection-error - Redis Connection Error
 */
router.get('/test/redis-connection-error', async (req, res) => {
  try {
    throw new Error('Redis connection failed: connect ECONNREFUSED 127.0.0.1:6379');
  } catch (error) {
    logger.logError(
      'Redis connection error',
      error,
      {
        operation: 'redis_connect',
        endpoint: '/test/redis-connection-error',
        redis_host: '127.0.0.1',
        redis_port: 6379,
        error_code: 'ECONNREFUSED'
      },
      req.context
    );
    res.status(503).json({ error: 'Redis connection failed' });
  }
});

/**
 * GET /test/redis-timeout - Redis Operation Timeout (유사 시나리오 3)
 */
router.get('/test/redis-timeout', async (req, res) => {
  try {
    throw new Error('Redis operation timeout: GET operation exceeded 2000ms');
  } catch (error) {
    logger.logError(
      'Redis operation timeout',
      error,
      {
        operation: 'redis_get',
        endpoint: '/test/redis-timeout',
        redis_host: '127.0.0.1',
        redis_port: 6379,
        timeout_ms: 2000,
        redis_operation: 'GET'
      },
      req.context
    );
    res.status(504).json({ error: 'Redis operation timeout' });
  }
});

/**
 * GET /test/json-parse-error - JSON Parse Error
 */
router.get('/test/json-parse-error', (req, res) => {
  try {
    const invalidJson = '{name: "test", invalid}';
    const parsed = JSON.parse(invalidJson);

    res.json(parsed);
  } catch (error) {
    logger.logError(
      'JSON parse error',
      error,
      {
        operation: 'parse_json',
        endpoint: '/test/json-parse-error',
        input: '{name: "test", invalid}'
      },
      req.context
    );
    res.status(400).json({ error: 'Invalid JSON format' });
  }
});

/**
 * GET /test/type-conversion-error - Type Conversion Error (유사 시나리오 4)
 */
router.get('/test/type-conversion-error', (req, res) => {
  try {
    const value = "not a number";
    const number = parseInt(value);

    if (isNaN(number)) {
      throw new Error(`Type conversion failed: cannot convert "${value}" to number`);
    }

    res.json({ number });
  } catch (error) {
    logger.logError(
      'Type conversion error',
      error,
      {
        operation: 'type_convert',
        endpoint: '/test/type-conversion-error',
        from_type: 'string',
        to_type: 'number',
        value: 'not a number'
      },
      req.context
    );
    res.status(400).json({ error: 'Type conversion failed' });
  }
});

/**
 * GET /test/file-not-found - File Not Found Error
 */
router.get('/test/file-not-found', (req, res) => {
  try {
    const fs = require('fs');
    fs.readFileSync('/nonexistent/path/config.json');

    res.json({ status: 'ok' });
  } catch (error) {
    logger.logError(
      'File not found error',
      error,
      {
        operation: 'read_file',
        endpoint: '/test/file-not-found',
        file_path: '/nonexistent/path/config.json',
        error_code: error.code
      },
      req.context
    );
    res.status(500).json({ error: 'Configuration file not found' });
  }
});

/**
 * GET /test/permission-denied - Permission Denied Error (유사 시나리오 5)
 */
router.get('/test/permission-denied', (req, res) => {
  try {
    const fs = require('fs');
    // 권한이 없는 파일 접근 시뮬레이션
    throw Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
  } catch (error) {
    logger.logError(
      'Permission denied error',
      error,
      {
        operation: 'write_file',
        endpoint: '/test/permission-denied',
        file_path: '/etc/protected/config.json',
        error_code: error.code
      },
      req.context
    );
    res.status(500).json({ error: 'Permission denied' });
  }
});

/**
 * GET /test/memory-leak - Memory Leak Simulation
 */
router.get('/test/memory-leak', (req, res) => {
  try {
    // 메모리 누수 시뮬레이션
    const largeArray = new Array(10000000).fill('data');
    global.memoryLeakArray = global.memoryLeakArray || [];
    global.memoryLeakArray.push(largeArray);

    logger.warn(
      'Memory leak detected',
      {
        operation: 'memory_allocation',
        endpoint: '/test/memory-leak',
        memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        array_count: global.memoryLeakArray.length
      },
      req.context
    );

    res.json({
      warning: 'Memory leak simulation',
      memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    });
  } catch (error) {
    logger.logError('Memory allocation failed', error, {}, req.context);
    res.status(500).json({ error: 'Memory error' });
  }
});

/**
 * GET /test/stack-overflow - Stack Overflow Error
 */
router.get('/test/stack-overflow', (req, res) => {
  try {
    function recursiveFunction(depth) {
      if (depth > 10000) {
        return depth;
      }
      return recursiveFunction(depth + 1);
    }

    recursiveFunction(0);
    res.json({ status: 'ok' });
  } catch (error) {
    logger.logError(
      'Stack overflow error',
      error,
      {
        operation: 'recursive_call',
        endpoint: '/test/stack-overflow',
        recursion_depth: 'exceeded'
      },
      req.context
    );
    res.status(500).json({ error: 'Maximum call stack size exceeded' });
  }
});

/**
 * GET /test/async-unhandled-rejection - Unhandled Promise Rejection
 */
router.get('/test/async-unhandled-rejection', async (req, res) => {
  try {
    await Promise.reject(new Error('Unhandled promise rejection in async operation'));
  } catch (error) {
    logger.logError(
      'Unhandled promise rejection',
      error,
      {
        operation: 'async_operation',
        endpoint: '/test/async-unhandled-rejection',
        promise_state: 'rejected'
      },
      req.context
    );
    res.status(500).json({ error: 'Async operation failed' });
  }
});

/**
 * GET /test/http-client-error - HTTP Client Request Error
 */
router.get('/test/http-client-error', async (req, res) => {
  try {
    // 외부 API 호출 실패 시뮬레이션
    throw new Error('HTTP request failed: connect ETIMEDOUT external-api.com:443');
  } catch (error) {
    logger.logError(
      'HTTP client request error',
      error,
      {
        operation: 'http_request',
        endpoint: '/test/http-client-error',
        target_url: 'https://external-api.com/api/data',
        error_code: 'ETIMEDOUT',
        timeout_ms: 5000
      },
      req.context
    );
    res.status(502).json({ error: 'External API request failed' });
  }
});

/**
 * GET /test/circuit-breaker-open - Circuit Breaker Open Error (유사 시나리오 6)
 */
router.get('/test/circuit-breaker-open', (req, res) => {
  try {
    throw new Error('Circuit breaker is OPEN: too many failures detected for external-api.com');
  } catch (error) {
    logger.logError(
      'Circuit breaker open',
      error,
      {
        operation: 'http_request',
        endpoint: '/test/circuit-breaker-open',
        target_service: 'external-api.com',
        circuit_state: 'OPEN',
        failure_count: 5,
        threshold: 5
      },
      req.context
    );
    res.status(503).json({ error: 'Service temporarily unavailable (circuit breaker open)' });
  }
});

/**
 * GET /test/rate-limit-exceeded - Rate Limit Exceeded
 */
router.get('/test/rate-limit-exceeded', (req, res) => {
  try {
    throw new Error('Rate limit exceeded: 429 Too Many Requests');
  } catch (error) {
    logger.logError(
      'Rate limit exceeded',
      error,
      {
        operation: 'api_call',
        endpoint: '/test/rate-limit-exceeded',
        rate_limit: 100,
        window: '1 minute',
        current_count: 105
      },
      req.context
    );
    res.status(429).json({ error: 'Too many requests' });
  }
});

/**
 * GET /test/auth-token-expired - Authentication Token Expired
 */
router.get('/test/auth-token-expired', (req, res) => {
  try {
    throw new Error('JWT token expired at 2025-10-15T12:00:00Z');
  } catch (error) {
    logger.logError(
      'Authentication token expired',
      error,
      {
        operation: 'authenticate',
        endpoint: '/test/auth-token-expired',
        token_type: 'JWT',
        expired_at: '2025-10-15T12:00:00Z'
      },
      req.context
    );
    res.status(401).json({ error: 'Token expired' });
  }
});

module.exports = router;
