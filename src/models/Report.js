'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reporter_user_id: { type: DataTypes.INTEGER, allowNull: false },
    requirement_id: { type: DataTypes.INTEGER },
    reported_user_id: { type: DataTypes.INTEGER },
    reason: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('PENDING', 'RESOLVED', 'DISMISSED'), defaultValue: 'PENDING' },
    admin_notes: { type: DataTypes.TEXT },
  }, {
    tableName: 'reports',
    underscored: true,
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, { foreignKey: 'reporter_user_id', as: 'reporter' });
    Report.belongsTo(models.User, { foreignKey: 'reported_user_id', as: 'reportedUser' });
    Report.belongsTo(models.Requirement, { foreignKey: 'requirement_id', as: 'requirement' });
  };

  return Report;
};
