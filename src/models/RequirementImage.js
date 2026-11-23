'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RequirementImage = sequelize.define('RequirementImage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    requirement_id: { type: DataTypes.INTEGER, allowNull: false },
    image_path: { type: DataTypes.STRING, allowNull: false },
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    tableName: 'requirement_images',
    underscored: true,
    timestamps: false,
  });

  RequirementImage.associate = (models) => {
    RequirementImage.belongsTo(models.Requirement, { foreignKey: 'requirement_id', as: 'requirement' });
  };

  return RequirementImage;
};
