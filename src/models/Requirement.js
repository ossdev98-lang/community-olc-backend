'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Requirement = sequelize.define('Requirement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    shop_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER },
    title: { type: DataTypes.STRING, allowNull: false },
    product_name: { type: DataTypes.STRING, allowNull: false },
    model_number: { type: DataTypes.STRING },
    part_name: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    condition: { type: DataTypes.ENUM('NEW', 'USED', 'REFURBISHED', 'ANY'), defaultValue: 'NEW' },
    expected_price: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CLOSED', 'HIDDEN'), defaultValue: 'ACTIVE' },
    published_at: { type: DataTypes.DATE },
    expires_at: { type: DataTypes.DATE },
    closed_at: { type: DataTypes.DATE },
    duration_hours: { type: DataTypes.INTEGER },
  }, {
    tableName: 'requirements',
    underscored: true,
  });

  Requirement.associate = (models) => {
    Requirement.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Requirement.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop' });
    Requirement.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Requirement.hasMany(models.RequirementImage, { foreignKey: 'requirement_id', as: 'images' });
    Requirement.hasMany(models.Conversation, { foreignKey: 'requirement_id', as: 'conversations' });
    Requirement.hasMany(models.Bookmark, { foreignKey: 'requirement_id', as: 'bookmarks' });
    Requirement.hasMany(models.Report, { foreignKey: 'requirement_id', as: 'reports' });
  };

  return Requirement;
};
