/**
 * Jest 테스트 프레임워크 설정
 */
module.exports = {
  // 테스트 환경
  testEnvironment: 'node',

  // 커버리지 수집 대상
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/server.js',
  ],

  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 커버리지 리포터
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
  ],

  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],

  // 테스트 전/후 설정
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 모듈 경로 매핑
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },

  // 타임아웃
  testTimeout: 10000,

  // 상세 출력
  verbose: true,

  // 첫 실패 시 중단
  bail: false,

  // 캐시 사용
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
};
