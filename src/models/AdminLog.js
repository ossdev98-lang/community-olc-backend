'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminLog = sequelize.define('AdminLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    admin_user_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    entity_type: { type: DataTypes.STRING },
    entity_id: { type: DataTypes.INTEGER },
    details: { type: DataTypes.TEXT },
  }, {
    tableName: 'admin_logs',
    underscored: true,
    timestamps: false,
  });

  AdminLog.associate = (models) => {
    AdminLog.belongsTo(models.User, { foreignKey: 'admin_user_id', as: 'adminUser' });
  };

  return AdminLog;
};
