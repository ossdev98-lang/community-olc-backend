const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { error } = require('../utils/responseHandler');
const db = require('../models');

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

async function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return error(res, 'Authentication required', 401);
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await db.User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return error(res, 'User not found', 401);
    }
    if (user.status === 'SUSPENDED') {
      return error(res, 'Account suspended', 403);
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token', 401);
    }
    return error(res, 'Authentication failed', 401);
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return error(res, 'Authentication required', 401);
  }
  if (req.user.role !== 'ADMIN') {
    return error(res, 'Admin access required', 403);
  }
  next();
}

function optionalAuthMiddleware(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const decoded = jwt.verify(token, config.jwt.secret);
    db.User.findByPk(decoded.id, { attributes: { exclude: ['password'] } }).then((user) => {
      req.user = user || null;
      next();
    }).catch(() => next());
  } catch (err) {
    next();
  }
}

module.exports = { authMiddleware, adminMiddleware, optionalAuthMiddleware };
