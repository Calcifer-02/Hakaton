// Middleware для проверки JWT токена
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH !== 'false';

// Middleware для проверки авторизации
const authMiddleware = async (req, res, next) => {
  // Если авторизация отключена (для разработки)
  if (!REQUIRE_AUTH) {
    console.log('⚠️  Auth disabled - development mode');
    req.user = { id: 'dev-user', roles: ['USER'] };
    return next();
  }

  try {
    // Получаем токен из заголовка или куки
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token && req.headers.cookie) {
      // Пытаемся получить токен из куки
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      token = cookies.token || cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен авторизации не предоставлен'
      });
    }

    // Валидация токена
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Невалидный или истёкший токен'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка проверки авторизации'
    });
  }
};

// Опциональный middleware - пропускает без токена (для публичных эндпоинтов с опциональной авторизацией)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      token = cookies.token || cookies.auth_token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (jwtError) {
        // Игнорируем ошибку валидации для опционального middleware
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
