/**
 * 테스트용 에러 API 엔드포인트
 * 다양한 종류의 에러를 발생시켜 LLM 분석용 데이터를 생성합니다.
 */

const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// 1. Database Connection Error
router.get('/1/database-connection', (req, res) => {
  logger.logError(
    'Database connection failed',
    new Error('Could not connect to PostgreSQL database at localhost:5432'),
    {
      database: 'postgres',
      host: 'localhost',
      port: 5432,
      retry_count: 3,
      error_code: 'ECONNREFUSED',
      operation: 'db_connect'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(503).json({ error: 'Database connection failed' });
});

// 2. Null/Undefined Reference Error - 실제 스택 트레이스 발생
router.get('/2/null-pointer', (req, res) => {
  // 실제 에러를 발생시켜 스택 트레이스가 로그에 포함되도록 함
  const data = null;
  const result = data.property; // TypeError with full stack trace
  res.json({ message: "This line will never be reached" });
});

// 3. Timeout Error
router.get('/3/timeout', (req, res) => {
  logger.logError(
    'Request timeout exceeded',
    new Error('External API request timed out after 30 seconds'),
    {
      api_endpoint: 'https://payment-api.example.com/charge',
      timeout_seconds: 30,
      retry_attempt: 2,
      operation: 'external_api_call'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(504).json({ error: 'Gateway timeout' });
});

// 4. Authentication Error
router.get('/4/authentication', (req, res) => {
  logger.logError(
    'Authentication failed - invalid credentials',
    new Error('JWT token validation failed'),
    {
      user_id: 'unknown',
      token_type: 'Bearer',
      ip_address: req.ip,
      operation: 'authenticate',
      details: 'Token signature verification failed or token expired'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(401).json({ error: 'Unauthorized - invalid token' });
});

// 5. Permission Denied Error
router.get('/5/permission-denied', (req, res) => {
  logger.logError(
    'Permission denied for user action',
    new Error('User does not have required permissions'),
    {
      user_id: 'user123',
      user_role: 'USER',
      required_role: 'ADMIN',
      action: 'delete_user',
      operation: 'permission_check'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(403).json({ error: 'Forbidden - insufficient permissions' });
});

// 6. Validation Error
router.get('/6/validation', (req, res) => {
  logger.logError(
    'Data validation failed',
    new Error('Invalid input data format'),
    {
      field_errors: {
        email: 'Invalid email format',
        age: 'Must be between 0 and 150',
        phone: 'Required field missing'
      },
      input_data: {
        email: 'invalid-email',
        age: -5
      },
      operation: 'validate_input'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(422).json({ error: 'Validation error' });
});

// 7. Resource Not Found Error
router.get('/7/resource-not-found', (req, res) => {
  const resourceId = 'prod_12345';
  logger.logError(
    'Resource not found in database',
    new Error(`Product with ID ${resourceId} does not exist`),
    {
      resource_type: 'Product',
      resource_id: resourceId,
      query: `SELECT * FROM products WHERE id = '${resourceId}'`,
      operation: 'find_resource'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(404).json({ error: `Product ${resourceId} not found` });
});

// 8. Rate Limit Exceeded Error
router.get('/8/rate-limit', (req, res) => {
  logger.logError(
    'Rate limit exceeded for API endpoint',
    new Error('Too many requests from this IP address'),
    {
      ip_address: req.ip,
      requests_count: 150,
      limit: 100,
      window_minutes: 1,
      retry_after_seconds: 45,
      operation: 'rate_limit_check'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(429).json({ error: 'Too many requests - rate limit exceeded' });
});

// 9. External API Failure Error
router.get('/9/external-api-failure', (req, res) => {
  logger.logError(
    'External API call failed',
    new Error('Third-party weather API returned error'),
    {
      api_name: 'WeatherAPI',
      endpoint: 'https://api.weather.com/v1/current',
      status_code: 500,
      response_time_ms: 2500,
      retry_count: 3,
      operation: 'external_api_call'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(502).json({ error: 'Bad gateway - external service unavailable' });
});

// 10. Memory Overflow Error
router.get('/10/memory-overflow', (req, res) => {
  logger.logError(
    'Memory allocation failed',
    new Error('Insufficient memory to complete operation'),
    {
      operation: 'large_dataset_processing',
      requested_memory_mb: 2048,
      available_memory_mb: 512,
      dataset_size_records: 10000000
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(507).json({ error: 'Insufficient storage' });
});

// 11. Database Deadlock Error
router.get('/11/deadlock', (req, res) => {
  logger.logError(
    'Database deadlock detected',
    new Error('Deadlock found when trying to get lock'),
    {
      transaction_id: 'txn_78901',
      tables_involved: ['users', 'orders'],
      lock_wait_timeout_seconds: 50,
      retry_suggested: true,
      operation: 'db_transaction'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(409).json({ error: 'Conflict - deadlock detected' });
});

// 12. File System Error
router.get('/12/file-not-found', (req, res) => {
  logger.logError(
    'File operation failed',
    new Error('Required configuration file not found'),
    {
      file_path: '/etc/app/config.yaml',
      operation: 'read_file',
      working_directory: '/app',
      error_code: 'ENOENT'
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(500).json({ error: 'Configuration file missing' });
});

// 13. JSON Parse Error
router.get('/13/json-parse-error', (req, res) => {
  try {
    const invalidJson = '{name: "test", invalid}';
    JSON.parse(invalidJson);
  } catch (error) {
    logger.logError(
      'JSON parse error',
      error,
      {
        operation: 'parse_json',
        input: '{name: "test", invalid}',
        source: 'external_api_response'
      },
      {
        request_id: req.id,
        trace_id: req.headers['x-trace-id'],
        span_id: req.headers['x-span-id']
      }
    );
    res.status(400).json({ error: 'Invalid JSON format' });
  }
});

// 14. Type Conversion Error
router.get('/14/type-error', (req, res) => {
  try {
    const value = 'not a number';
    const number = parseInt(value);
    if (isNaN(number)) {
      throw new Error(`Cannot convert '${value}' to number`);
    }
  } catch (error) {
    logger.logError(
      'Type conversion error',
      error,
      {
        operation: 'type_convert',
        from_type: 'string',
        to_type: 'number',
        value: 'not a number'
      },
      {
        request_id: req.id,
        trace_id: req.headers['x-trace-id'],
        span_id: req.headers['x-span-id']
      }
    );
    res.status(400).json({ error: 'Type conversion failed' });
  }
});

// 15. Redis Connection Error
router.get('/15/redis-connection', (req, res) => {
  logger.logError(
    'Redis connection error',
    new Error('Redis connection failed: connect ECONNREFUSED 127.0.0.1:6379'),
    {
      operation: 'redis_connect',
      redis_host: '127.0.0.1',
      redis_port: 6379,
      error_code: 'ECONNREFUSED',
      retry_count: 3
    },
    {
      request_id: req.id,
      trace_id: req.headers['x-trace-id'],
      span_id: req.headers['x-span-id']
    }
  );
  res.status(503).json({ error: 'Redis connection failed' });
});

// ===== 스택 트레이스 발생 에러 (16-25번) =====

// 16. Division by Zero Error
router.get('/16/division-by-zero', (req, res) => {
  const result = 100 / 0;  // Infinity in JavaScript, but demonstrates arithmetic
  const obj = undefined;
  const value = obj.property;  // TypeError -실제 스택 트레이스
  res.json({ result: value });
});

// 17. Array Index Out of Bounds
router.get('/17/index-out-of-range', (req, res) => {
  const items = [1, 2, 3];
  const value = items[10];
  // Force an error by accessing property on undefined
  const result = value.toString();  // TypeError - 실제 스택 트레이스
  res.json({ value: result });
});

// 18. Object Property Access on Undefined
router.get('/18/undefined-property-access', (req, res) => {
  const user = undefined;
  const name = user.name;  // TypeError: Cannot read property 'name' of undefined
  res.json({ name });
});

// 19. Function Call on Non-Function
router.get('/19/not-a-function', (req, res) => {
  const notAFunction = "I am a string";
  const result = notAFunction();  // TypeError: notAFunction is not a function
  res.json({ result });
});

// 20. JSON Parse Error
router.get('/20/json-parse-error', (req, res) => {
  const invalidJson = '{invalid json}';
  const data = JSON.parse(invalidJson);  // SyntaxError: Unexpected token i in JSON
  res.json({ data });
});

// 21. Reference Error - Undefined Variable
router.get('/21/reference-error', (req, res) => {
  const result = nonExistentVariable + 10;  // ReferenceError: nonExistentVariable is not defined
  res.json({ result });
});

// 22. Type Error - Invalid Argument
router.get('/22/type-error', (req, res) => {
  const arr = null;
  arr.push(123);  // TypeError: Cannot read property 'push' of null
  res.json({ arr });
});

// 23. Range Error - Invalid Array Length
router.get('/23/range-error', (req, res) => {
  const arr = new Array(-1);  // RangeError: Invalid array length
  res.json({ arr });
});

// 24. Async Error - Promise Rejection
router.get('/24/promise-rejection', async (req, res) => {
  const promise = new Promise((resolve, reject) => {
    reject(new Error('Promise rejected'));
  });
  const result = await promise;  // UnhandledPromiseRejection
  res.json({ result });
});

// 25. Nested Property Access Error
router.get('/25/nested-property-error', (req, res) => {
  const config = { server: null };
  const port = config.server.port;  // TypeError: Cannot read property 'port' of null
  res.json({ port });
});

module.exports = router;
