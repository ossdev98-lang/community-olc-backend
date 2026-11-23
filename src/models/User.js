'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    mobile: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('MEMBER', 'ADMIN'), defaultValue: 'MEMBER' },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'), defaultValue: 'PENDING' },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    last_login: { type: DataTypes.DATE },
  }, {
    tableName: 'users',
    underscored: true,
  });

  User.associate = (models) => {
    User.hasMany(models.Shop, { foreignKey: 'user_id', as: 'shops' });
    User.hasMany(models.Requirement, { foreignKey: 'user_id', as: 'requirements' });
    User.hasMany(models.Conversation, { foreignKey: 'owner_user_id', as: 'ownedConversations' });
    User.hasMany(models.Conversation, { foreignKey: 'interested_user_id', as: 'interestedConversations' });
    User.hasMany(models.Message, { foreignKey: 'sender_user_id', as: 'messages' });
    User.hasMany(models.Quotation, { foreignKey: 'sender_user_id', as: 'quotations' });
    User.hasMany(models.Bookmark, { foreignKey: 'user_id', as: 'bookmarks' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
    User.hasMany(models.Report, { foreignKey: 'reporter_user_id', as: 'reports' });
    User.hasMany(models.Report, { foreignKey: 'reported_user_id', as: 'reportsReceived' });
    User.hasMany(models.ContactShare, { foreignKey: 'shared_by_user_id', as: 'contactShares' });
    User.hasMany(models.AdminLog, { foreignKey: 'admin_user_id', as: 'adminLogs' });
  };

  return User;
};
