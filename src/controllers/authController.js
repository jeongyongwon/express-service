/**
 * 인증 컨트롤러
 * 사용자 로그인, 회원가입, 토큰 관리
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * 사용자 회원가입
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;

    // 사용자 존재 확인 (실제로는 DB 조회)
    // const existingUser = await User.findOne({ where: { email } });
    // if (existingUser) {
    //   return res.status(409).json({ error: '이미 존재하는 이메일입니다' });
    // }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성 (실제로는 DB 저장)
    const newUser = {
      // id: await User.create({ username, email, password: hashedPassword, fullName }),
      username,
      email,
      fullName,
    };

    logger.info('User registered successfully', { username, email });

    res.status(201).json({
      message: '회원가입이 완료되었습니다',
      user: newUser,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * 사용자 로그인
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 사용자 조회 (실제로는 DB 조회)
    // const user = await User.findOne({ where: { email } });
    // if (!user) {
    //   return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    // }

    // 비밀번호 확인
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    // }

    // Mock user for example
    const user = {
      id: 1,
      username: 'testuser',
      email,
      role: 'user',
    };

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      message: '로그인 성공',
      accessToken: token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * 토큰 갱신
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: '리프레시 토큰이 필요합니다' });
    }

    // 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // 새 액세스 토큰 생성
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('Token refreshed successfully', { userId: decoded.id });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: '유효하지 않은 리프레시 토큰입니다' });
  }
};

/**
 * 로그아웃
 */
const logout = async (req, res, next) => {
  try {
    // 실제로는 리프레시 토큰을 블랙리스트에 추가하거나 DB에서 삭제
    logger.info('User logged out', { userId: req.user?.id });

    res.json({ message: '로그아웃되었습니다' });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
