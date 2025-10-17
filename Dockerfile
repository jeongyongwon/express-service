FROM node:18-alpine

WORKDIR /app

# 시스템 패키지 설치 및 보안 업데이트
RUN apk update && apk upgrade && \
    apk add --no-cache \
    curl \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# 로그 디렉토리 생성
RUN mkdir -p /var/log/express-service

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 애플리케이션 코드 복사
COPY . .

# 환경 변수 설정
ENV LOG_PATH=/var/log/express-service
ENV NODE_ENV=production

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 비-root 사용자로 실행
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app /var/log/express-service

USER nodejs

EXPOSE 3000

CMD ["node", "src/server.js"]
