'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    label: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'categories',
    underscored: true,
  });

  Category.associate = (models) => {
    Category.hasMany(models.Requirement, { foreignKey: 'category_id', as: 'requirements' });
  };

  return Category;
};
