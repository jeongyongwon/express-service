/**
 * ESLint 설정 파일
 * 코드 품질 및 일관성 유지
 */
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 일반 규칙
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',

    // 코드 스타일
    'indent': ['error', 2],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'max-len': ['warn', { code: 100, ignoreComments: true, ignoreStrings: true }],

    // 함수 규칙
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': 'error',
    'func-style': ['warn', 'expression', { allowArrowFunctions: true }],

    // Promise 규칙
    'no-async-promise-executor': 'error',
    'prefer-promise-reject-errors': 'error',

    // 에러 처리
    'no-throw-literal': 'error',
    'handle-callback-err': 'error',

    // 보안 관련
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
  },
};
