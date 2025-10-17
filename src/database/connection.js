/**
 * 데이터베이스 연결 및 Sequelize 설정
 */
const { Sequelize } = require('sequelize');
const logger = require('../config/logger');

const {
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_NAME = 'express_db',
  DB_USER = 'postgres',
  DB_PASSWORD = 'password',
  DB_POOL_MAX = 10,
  DB_POOL_MIN = 2,
  DB_POOL_ACQUIRE = 30000,
  DB_POOL_IDLE = 10000,
  NODE_ENV = 'development',
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: parseInt(DB_POOL_MAX, 10),
    min: parseInt(DB_POOL_MIN, 10),
    acquire: parseInt(DB_POOL_ACQUIRE, 10),
    idle: parseInt(DB_POOL_IDLE, 10),
  },
  dialectOptions: {
    ssl: NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
  },
});

/**
 * 데이터베이스 연결 테스트
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

/**
 * 데이터베이스 동기화
 * @param {Object} options - Sequelize sync options
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    logger.info('✅ Database synchronized successfully');
  } catch (error) {
    logger.error('❌ Database sync failed:', error);
    throw error;
  }
};

/**
 * 데이터베이스 연결 종료
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeConnection,
};
