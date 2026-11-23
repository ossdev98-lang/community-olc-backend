const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../models');
const { success, error } = require('../utils/responseHandler');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');

const PUBLIC_FIELDS = ['id', 'name', 'email', 'mobile', 'role', 'status', 'is_verified', 'last_login', 'created_at', 'updated_at'];

function userJson(user) {
  const u = user.toJSON ? user.toJSON() : user;
  return PUBLIC_FIELDS.reduce((acc, key) => { acc[key] = u[key]; return acc; }, {});
}

async function register(req, res) {
  const { name, email, mobile, password, shopName, ownerName, businessType, city, state, address, gstin, description, specializations } = req.body;

  try {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) return error(res, 'Email already registered', 409);

    const existingShop = await db.Shop.findOne({ where: { email } });
    if (existingShop) return error(res, 'Shop email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.User.create({
      name: ownerName || name,
      email,
      mobile,
      password: passwordHash,
      role: 'MEMBER',
      status: 'PENDING',
      is_verified: false,
    });

    const shop = await db.Shop.create({
      user_id: user.id,
      shop_name: shopName,
      owner_name: ownerName || name,
      business_type: businessType,
      description: description || null,
      mobile,
      email,
      address: address || null,
      city: city || null,
      state: state || null,
      pincode: null,
      logo: null,
      business_documents: null,
      specializations: Array.isArray(specializations) ? specializations : [],
      is_verified: false,
      approval_status: 'PENDING',
    });

    return success(res, 'Registration submitted. Awaiting admin approval.', {
      user: userJson(user),
      shop: {
        id: shop.id,
        shop_name: shop.shop_name,
        approval_status: shop.approval_status,
      },
    }, 201);
  } catch (err) {
    return error(res, err.message || 'Registration failed', 500);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return error(res, 'Invalid email or password', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, 'Invalid email or password', 401);

    if (user.status === 'SUSPENDED') return error(res, 'Account is suspended', 403);
    if (user.status === 'REJECTED') return error(res, 'Account was rejected', 403);

    const shop = await db.Shop.findOne({ where: { user_id: user.id } });

    await user.update({ last_login: new Date() });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const shopData = shop ? {
      id: shop.id,
      shop_name: shop.shop_name,
      owner_name: shop.owner_name,
      business_type: shop.business_type,
      description: shop.description,
      mobile: shop.mobile,
      email: shop.email,
      address: shop.address,
      city: shop.city,
      state: shop.state,
      pincode: shop.pincode,
      logo: shop.logo,
      business_documents: shop.business_documents,
      specializations: shop.specializations,
      is_verified: shop.is_verified,
      approval_status: shop.approval_status,
    } : null;

    return success(res, 'Login successful', {
      token,
      refreshToken,
      user: {
        ...userJson(user),
        shopId: shop ? shop.id : null,
        shopName: shop ? shop.shop_name : null,
        shop,
        isAdmin: user.role === 'ADMIN',
      },
    });
  } catch (err) {
    return error(res, err.message || 'Login failed', 500);
  }
}

async function me(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return error(res, 'User not found', 404);
    const shop = await db.Shop.findOne({ where: { user_id: user.id } });
    return success(res, 'User profile', {
      ...userJson(user),
      shopId: shop ? shop.id : null,
      shopName: shop ? shop.shop_name : null,
      shop,
      isAdmin: user.role === 'ADMIN',
    });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch profile', 500);
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return error(res, 'Refresh token required', 400);
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return error(res, 'User not found', 401);
    const token = generateToken(user);
    const newRefresh = generateRefreshToken(user);
    return success(res, 'Token refreshed', { token, refreshToken: newRefresh });
  } catch (err) {
    return error(res, 'Invalid or expired refresh token', 401);
  }
}

async function logout(req, res) {
  return success(res, 'Logged out');
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await db.User.findOne({ where: { email } });
  if (!user) return success(res, 'If an account exists, a reset OTP has been sent.');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await db.OtpVerification.create({
    email,
    otp,
    purpose: 'FORGOT_PASSWORD',
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });
  console.log(`[OTP] ${email}: ${otp} (SMS provider not configured)`);
  return success(res, 'If an account exists, a reset OTP has been sent.');
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  const record = await db.OtpVerification.findOne({
    where: { email, otp, purpose: 'FORGOT_PASSWORD', is_used: false },
    order: [['created_at', 'DESC']],
  });
  if (!record) return error(res, 'Invalid or expired OTP', 400);
  if (record.expires_at < new Date()) return error(res, 'OTP expired', 400);
  await record.update({ is_used: true });
  return success(res, 'OTP verified');
}

async function resetPassword(req, res) {
  const { email, otp, password } = req.body;
  const record = await db.OtpVerification.findOne({
    where: { email, otp, purpose: 'FORGOT_PASSWORD', is_used: true },
    order: [['created_at', 'DESC']],
  });
  if (!record) return error(res, 'OTP verification required', 400);
  const user = await db.User.findOne({ where: { email } });
  if (!user) return error(res, 'User not found', 404);
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  return success(res, 'Password reset successful');
}

module.exports = {
  register, login, logout, me, refreshToken, forgotPassword, verifyOtp, resetPassword,
};
