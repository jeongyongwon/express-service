/**
 * 요청 유효성 검사 미들웨어
 */

const { VALIDATION, ERROR_MESSAGES } = require('../config/constants');
const logger = require('../config/logger');

/**
 * 사용자 ID 유효성 검사
 */
function validateUserId(req, res, next) {
  const userId = parseInt(req.params.id);

  if (isNaN(userId) || userId <= 0) {
    logger.warn('유효하지 않은 사용자 ID', {
      ...req.context,
      context: { user_id: req.params.id, validation: 'positive_integer' }
    });
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_USER_ID,
      details: 'ID는 양수여야 합니다'
    });
  }

  if (userId > VALIDATION.USER_ID_MAX) {
    logger.warn('사용자 ID 범위 초과', {
      ...req.context,
      context: { user_id: userId, max_allowed: VALIDATION.USER_ID_MAX }
    });
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_USER_ID,
      details: `ID는 ${VALIDATION.USER_ID_MAX} 이하여야 합니다`
    });
  }

  req.userId = userId;
  next();
}

/**
 * 사용자 생성 데이터 유효성 검사
 */
function validateUserCreation(req, res, next) {
  const { name, email } = req.body;

  // 필수 필드 검사
  if (!name || !email) {
    logger.warn('필수 필드 누락', {
      ...req.context,
      context: {
        provided_fields: Object.keys(req.body),
        missing: [!name && 'name', !email && 'email'].filter(Boolean)
      }
    });
    return res.status(400).json({
      error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      missing_fields: [!name && 'name', !email && 'email'].filter(Boolean)
    });
  }

  // 이름 길이 검사
  const trimmedName = name.trim();
  if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    logger.warn('이름이 너무 짧음', {
      ...req.context,
      context: { name: trimmedName, length: trimmedName.length, min: VALIDATION.NAME_MIN_LENGTH }
    });
    return res.status(400).json({
      error: '이름은 최소 2자 이상이어야 합니다',
      provided_length: trimmedName.length
    });
  }

  if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    logger.warn('이름이 너무 김', {
      ...req.context,
      context: { name: trimmedName, length: trimmedName.length, max: VALIDATION.NAME_MAX_LENGTH }
    });
    return res.status(400).json({
      error: `이름은 최대 ${VALIDATION.NAME_MAX_LENGTH}자까지 가능합니다`,
      provided_length: trimmedName.length
    });
  }

  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    logger.warn('잘못된 이메일 형식', {
      ...req.context,
      context: { email, validation: 'email_format' }
    });
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_EMAIL
    });
  }

  // 이메일 길이 검사 (RFC 5321)
  if (email.length > VALIDATION.EMAIL_MAX_LENGTH) {
    logger.warn('이메일 주소가 너무 김', {
      ...req.context,
      context: { email, length: email.length, max: VALIDATION.EMAIL_MAX_LENGTH }
    });
    return res.status(400).json({
      error: '이메일 주소가 너무 깁니다',
      max_length: VALIDATION.EMAIL_MAX_LENGTH
    });
  }

  next();
}

module.exports = {
  validateUserId,
  validateUserCreation
};
