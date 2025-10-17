/**
 * 간단한 인메모리 캐시 유틸리티
 */

const logger = require('../config/logger');

class SimpleCache {
  constructor(defaultTTL = 60) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL; // 초 단위
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * 캐시에서 값 가져오기
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      logger.debug('캐시 미스', { key });
      return null;
    }

    // TTL 확인
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      logger.debug('캐시 만료', { key });
      return null;
    }

    this.stats.hits++;
    logger.debug('캐시 히트', { key });
    return entry.value;
  }

  /**
   * 캐시에 값 저장
   */
  set(key, value, ttl = null) {
    const expiresAt = Date.now() + (ttl || this.defaultTTL) * 1000;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });

    this.stats.sets++;
    logger.debug('캐시 저장', { key, ttl: ttl || this.defaultTTL });
  }

  /**
   * 캐시에서 값 삭제
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      logger.debug('캐시 삭제', { key });
    }
    return deleted;
  }

  /**
   * 만료된 항목 정리
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('캐시 정리 완료', {
        cleaned_entries: cleanedCount,
        remaining_entries: this.cache.size
      });
    }

    return cleanedCount;
  }

  /**
   * 모든 캐시 삭제
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    logger.info('캐시 전체 삭제', { cleared_entries: size });
  }

  /**
   * 캐시 통계 조회
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0
      ? ((this.stats.hits / totalRequests) * 100).toFixed(2)
      : 0;

    return {
      entries: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hit_rate: parseFloat(hitRate),
      sets: this.stats.sets,
      deletes: this.stats.deletes
    };
  }
}

// 전역 캐시 인스턴스
const userCache = new SimpleCache(60);

// 주기적으로 만료된 캐시 정리 (5분마다)
setInterval(() => {
  userCache.cleanup();
}, 5 * 60 * 1000);

module.exports = {
  SimpleCache,
  userCache
};
