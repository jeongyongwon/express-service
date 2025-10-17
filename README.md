# Express.js Service with Structured Logging

Node.js/Express service with winston-based structured logging

## Features

- **Structured Logging**: JSON logs via winston
- **Request Tracing**: trace_id/span_id propagation
- **Health Monitoring**: /health endpoint
- **Rate Limiting**: IP-based rate limiting
- **CORS Support**: Configurable origin whitelist
- **Error Tracking**: Comprehensive error scenarios

## Quick Start

```bash
npm install
npm run dev  # Development with nodemon
npm start    # Production
```

## API Endpoints

- `GET /` - Root health check
- `GET /health` - Detailed health status
- `GET /api/users/:id` - Get user (with validation)
- `POST /api/users` - Create user (with email validation)
- `GET /api/users/test/*` - Various error scenarios

## Environment Variables

```
PORT=3000
NODE_ENV=production
SERVICE_NAME=express-service
LOG_PATH=/var/log/express-service
```

## Recent Updates

### v0.2.0
- Added health check endpoint
- Implemented rate limiting
- Added CORS middleware
- Improved validation and error handling
- Performance optimizations

### v0.1.0
- Initial release with structured logging
