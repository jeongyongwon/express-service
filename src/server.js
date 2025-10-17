/**
 * Express.js 서버
 * 통합 로그 포맷을 사용하는 예시 애플리케이션
 */

const express = require('express');
const logger = require('./config/logger');
const loggingMiddleware = require('./middleware/logging');
const usersRouter = require('./routes/users');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

// 로그 디렉토리 생성
const logsDir = process.env.LOG_PATH || path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 환경 변수 업데이트 (logger에서 사용)
process.env.LOG_PATH = logsDir;

// 미들웨어
app.use(express.json());
app.use(loggingMiddleware);

// 라우트
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed', req.context);

  res.json({
    message: 'Express.js Logging Example',
    status: 'healthy'
  });
});

app.use('/api/users', usersRouter);

// 404 핸들러
app.use((req, res) => {
  logger.warn('Route not found', {
    ...req.context,
    http: {
      method: req.method,
      path: req.path
    }
  });

  res.status(404).json({ error: 'Not found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  logger.logError(
    'Unhandled error',
    err,
    { endpoint: req.path },
    req.context || {}
  );

  res.status(500).json({ error: 'Internal server error' });
});

// 서버 시작
app.listen(PORT, () => {
  logger.info('Application started', {
    message: `Express.js server listening on port ${PORT}`,
    port: PORT
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Application shutdown', {
    message: 'SIGTERM received, shutting down gracefully'
  });
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Application shutdown', {
    message: 'SIGINT received, shutting down gracefully'
  });
  process.exit(0);
});
