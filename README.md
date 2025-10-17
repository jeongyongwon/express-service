# Express.js 로깅 예시

Winston을 사용한 Express.js 애플리케이션의 통합 로그 포맷 구현 예시입니다.

## 주요 기능

- **Winston**: Node.js의 유연한 로깅 라이브러리
- **JSON 로그 출력**: 파싱하기 쉬운 JSON 형식
- **분산 추적 지원**: trace_id, span_id 컨텍스트 전파
- **HTTP 요청 로깅**: 미들웨어를 통한 자동 로깅
- **쿼리 로깅**: DB 쿼리 실행 시간 및 상세 정보
- **에러 로깅**: 스택 트레이스 포함 에러 로그

## 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 개발 서버 실행
npm run dev

# 프로덕션 실행
npm start
```

## Docker 실행

```bash
docker build -t express-logging-example .
docker run -p 3000:3000 \
  -e SERVICE_NAME=express-service \
  -e ENVIRONMENT=production \
  express-logging-example
```

## API 엔드포인트

- `GET /` - 헬스 체크
- `GET /api/users/:id` - 사용자 조회 (SELECT 쿼리 로그)
- `POST /api/users` - 사용자 생성 (INSERT 쿼리 로그)
- `GET /api/users/test/error` - 에러 로그 테스트
- `GET /api/users/test/slow-query` - 느린 쿼리 경고 로그 테스트

## 로그 설정

`src/config/logger.js`에서 로그 설정을 변경할 수 있습니다.

### 로그 출력 위치

- **콘솔**: JSON 형식으로 stdout 출력
- **파일**: `./logs/app.log` (최대 10MB, 5개 파일 로테이션)
- **에러 파일**: `./logs/error.log` (ERROR 레벨만)

### 환경 변수

- `SERVICE_NAME`: 서비스 이름 (기본: express-service)
- `ENVIRONMENT`: 환경 (dev/staging/production, 기본: development)
- `PORT`: 서버 포트 (기본: 3000)
- `LOG_LEVEL`: 로그 레벨 (기본: info)

## 로그 예시

### HTTP 요청 로그
```json
{
  "timestamp": "2025-10-14T12:34:56.789Z",
  "level": "INFO",
  "service": "express-service",
  "environment": "production",
  "host": "server-01",
  "message": "HTTP request completed",
  "trace_id": "uuid-trace-id",
  "span_id": "uuid-span-id",
  "request_id": "uuid-request-id",
  "http": {
    "method": "GET",
    "path": "/api/users/1",
    "status_code": 200,
    "duration_ms": 52,
    "client_ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### 쿼리 로그
```json
{
  "timestamp": "2025-10-14T12:34:56.789Z",
  "level": "INFO",
  "service": "express-service",
  "environment": "production",
  "host": "server-01",
  "message": "Database query executed",
  "trace_id": "uuid-trace-id",
  "span_id": "uuid-span-id",
  "query": {
    "type": "SELECT",
    "statement": "SELECT * FROM users WHERE id = ?",
    "duration_ms": 45.12,
    "rows_affected": 1,
    "database": "user_db"
  },
  "context": {
    "user_id": 1
  }
}
```

### 에러 로그
```json
{
  "timestamp": "2025-10-14T12:34:56.789Z",
  "level": "ERROR",
  "service": "express-service",
  "environment": "production",
  "host": "server-01",
  "message": "JSON parsing error occurred",
  "trace_id": "uuid-trace-id",
  "span_id": "uuid-span-id",
  "error": {
    "type": "SyntaxError",
    "message": "Unexpected token i in JSON at position 0",
    "stack_trace": "SyntaxError: Unexpected token i in JSON at position 0\n    at JSON.parse (<anonymous>)\n    ..."
  },
  "context": {
    "operation": "parse_json",
    "endpoint": "/error"
  }
}
```

## 테스트

```bash
# 사용자 생성
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# 사용자 조회
curl http://localhost:3000/api/users/1

# 에러 테스트
curl http://localhost:3000/api/users/test/error

# 느린 쿼리 테스트
curl http://localhost:3000/api/users/test/slow-query
```

## 프로젝트 구조

```
express-service/
├── src/
│   ├── config/
│   │   └── logger.js          # Winston 로거 설정
│   ├── middleware/
│   │   └── logging.js         # HTTP 로깅 미들웨어
│   ├── routes/
│   │   └── users.js           # 사용자 API 라우트
│   └── server.js              # Express 서버 엔트리포인트
├── logs/                      # 로그 파일 디렉토리 (자동 생성)
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
└── README.md
```
