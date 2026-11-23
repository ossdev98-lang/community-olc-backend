'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OtpVerification = sequelize.define('OtpVerification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING },
    mobile: { type: DataTypes.STRING },
    otp: { type: DataTypes.STRING, allowNull: false },
    purpose: { type: DataTypes.ENUM('REGISTER', 'FORGOT_PASSWORD', 'VERIFY_LOGIN'), defaultValue: 'REGISTER' },
    is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
  }, {
    tableName: 'otp_verifications',
    underscored: true,
    timestamps: false,
  });

  return OtpVerification;
};
