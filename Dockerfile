FROM node:18-alpine

WORKDIR /app

# 로그 디렉토리 생성
RUN mkdir -p /var/log/express-service

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV LOG_PATH=/var/log/express-service

EXPOSE 3000

CMD ["node", "src/server.js"]
