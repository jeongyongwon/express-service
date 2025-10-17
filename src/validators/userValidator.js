/**
 * 사용자 데이터 검증 스키마
 * Joi를 사용한 입력 데이터 검증
 */
const Joi = require('joi');

/**
 * 회원가입 요청 검증 스키마
 */
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': '사용자명은 영문자와 숫자만 포함할 수 있습니다',
      'string.min': '사용자명은 최소 3자 이상이어야 합니다',
      'string.max': '사용자명은 최대 50자까지 가능합니다',
      'any.required': '사용자명은 필수 항목입니다',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '유효한 이메일 주소를 입력하세요',
      'any.required': '이메일은 필수 항목입니다',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
      'string.pattern.base': '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다',
      'any.required': '비밀번호는 필수 항목입니다',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': '비밀번호가 일치하지 않습니다',
      'any.required': '비밀번호 확인은 필수 항목입니다',
    }),

  fullName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': '이름은 최소 2자 이상이어야 합니다',
      'string.max': '이름은 최대 100자까지 가능합니다',
    }),
});

/**
 * 로그인 요청 검증 스키마
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '유효한 이메일 주소를 입력하세요',
      'any.required': '이메일은 필수 항목입니다',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': '비밀번호는 필수 항목입니다',
    }),
});

/**
 * 사용자 업데이트 검증 스키마
 */
const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .optional(),

  fullName: Joi.string()
    .min(2)
    .max(100)
    .optional(),

  currentPassword: Joi.string()
    .when('newPassword', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .optional(),
}).min(1);

/**
 * 페이지네이션 검증 스키마
 */
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  sort: Joi.string()
    .valid('createdAt', 'updatedAt', 'username', 'email')
    .default('createdAt'),

  order: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC'),
});

/**
 * 검증 미들웨어 생성 함수
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: '입력 데이터가 유효하지 않습니다',
        details: errors,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  paginationSchema,
  validate,
};
