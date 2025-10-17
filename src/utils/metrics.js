/**
 * 애플리케이션 메트릭 수집 유틸리티
 */

class MetricsCollector {
  constructor() {
    this.requests = new Map(); // endpoint별 요청 수
    this.errors = new Map(); // endpoint별 에러 수
    this.responseTimes = new Map(); // endpoint별 응답 시간
    this.startTime = Date.now();
  }

  /**
   * 요청 메트릭 기록
   */
  recordRequest(method, path, statusCode, durationMs) {
    const key = `${method}:${path}`;

    // 요청 수 증가
    this.requests.set(key, (this.requests.get(key) || 0) + 1);

    // 에러 수 증가 (4xx, 5xx)
    if (statusCode >= 400) {
      this.errors.set(key, (this.errors.get(key) || 0) + 1);
    }

    // 응답 시간 저장
    if (!this.responseTimes.has(key)) {
      this.responseTimes.set(key, []);
    }
    const times = this.responseTimes.get(key);
    times.push(durationMs);

    // 최근 100개만 유지
    if (times.length > 100) {
      times.shift();
    }
  }

  /**
   * 엔드포인트별 메트릭 계산
   */
  getEndpointMetrics(key) {
    const requestCount = this.requests.get(key) || 0;
    const errorCount = this.errors.get(key) || 0;
    const times = this.responseTimes.get(key) || [];

    const [method, path] = key.split(':');

    const metrics = {
      method,
      path,
      total_requests: requestCount,
      total_errors: errorCount,
      error_rate: requestCount > 0
        ? parseFloat(((errorCount / requestCount) * 100).toFixed(2))
        : 0
    };

    if (times.length > 0) {
      const sum = times.reduce((a, b) => a + b, 0);
      metrics.avg_response_time_ms = parseFloat((sum / times.length).toFixed(2));
      metrics.max_response_time_ms = Math.max(...times);
      metrics.min_response_time_ms = Math.min(...times);
      metrics.p95_response_time_ms = this.calculatePercentile(times, 95);
    }

    return metrics;
  }

  /**
   * 백분위수 계산
   */
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * 전체 메트릭 조회
   */
  getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const totalRequests = Array.from(this.requests.values()).reduce((a, b) => a + b, 0);
    const totalErrors = Array.from(this.errors.values()).reduce((a, b) => a + b, 0);

    const endpoints = {};
    for (const key of this.requests.keys()) {
      const [method, path] = key.split(':');
      endpoints[path] = this.getEndpointMetrics(key);
    }

    return {
      uptime_seconds: uptimeSeconds,
      total_requests: totalRequests,
      total_errors: totalErrors,
      overall_error_rate: totalRequests > 0
        ? parseFloat(((totalErrors / totalRequests) * 100).toFixed(2))
        : 0,
      endpoints
    };
  }

  /**
   * 메트릭 초기화
   */
  reset() {
    this.requests.clear();
    this.errors.clear();
    this.responseTimes.clear();
    this.startTime = Date.now();
  }
}

// 전역 메트릭 수집기
const metricsCollector = new MetricsCollector();

module.exports = {
  MetricsCollector,
  metricsCollector
};
