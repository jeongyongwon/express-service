/**
 * Swagger 설정
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Logging Example API',
      version: '1.0.0',
      description: '통합 로그 포맷을 사용하는 Express.js 예시 애플리케이션 with 테스트 에러 API',
    },
    servers: [
      {
        url: 'http://localhost:8002',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Test Errors',
        description: 'LLM 분석용 테스트 에러 API',
      },
      {
        name: 'Users',
        description: '사용자 관리 API',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
