const jwt = require('jsonwebtoken');
const config = require('../config/env');

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function generateRefreshToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken };
