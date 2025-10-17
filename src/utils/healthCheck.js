/**
 * 헬스 체크 유틸리티
 */

const logger = require('../config/logger');

class HealthChecker {
  constructor() {
    this.startTime = Date.now();
    this.checks = new Map();
  }

  /**
   * 가동 시간 조회 (초)
   */
  getUptimeSeconds() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * 데이터베이스 헬스 체크
   */
  async checkDatabase() {
    const start = Date.now();

    try {
      // DB 연결 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 10));

      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency_ms: latency,
        connection_pool: {
          active: 2,
          idle: 8,
          max: 10
        }
      };
    } catch (error) {
      logger.error('데이터베이스 헬스 체크 실패', error, {
        component: 'database'
      });

      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Redis 헬스 체크
   */
  async checkRedis() {
    const start = Date.now();

    try {
      // Redis 연결 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 5));

      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency_ms: latency,
        memory_used_mb: 42.5,
        memory_peak_mb: 50.2
      };
    } catch (error) {
      logger.error('Redis 헬스 체크 실패', error, {
        component: 'redis'
      });

      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * 외부 API 헬스 체크
   */
  async checkExternalApi() {
    const start = Date.now();

    try {
      // 외부 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 20));

      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency_ms: latency,
        endpoint: 'https://api.example.com'
      };
    } catch (error) {
      logger.error('외부 API 헬스 체크 실패', error, {
        component: 'external_api'
      });

      return {
        status: 'degraded',
        error: error.message
      };
    }
  }

  /**
   * 전체 헬스 상태 조회
   */
  async getFullHealthStatus() {
    const [dbHealth, redisHealth, apiHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalApi()
    ]);

    const allHealthy =
      dbHealth.status === 'healthy' &&
      redisHealth.status === 'healthy' &&
      apiHealth.status === 'healthy';

    const anyUnhealthy =
      dbHealth.status === 'unhealthy' ||
      redisHealth.status === 'unhealthy';

    let overallStatus = 'healthy';
    if (anyUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (!allHealthy) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      uptime_seconds: this.getUptimeSeconds(),
      timestamp: new Date().toISOString(),
      service_name: 'express-service',
      components: {
        database: dbHealth,
        redis: redisHealth,
        external_api: apiHealth
      }
    };
  }
}

// 전역 헬스 체커 인스턴스
const healthChecker = new HealthChecker();

module.exports = {
  HealthChecker,
  healthChecker
};
