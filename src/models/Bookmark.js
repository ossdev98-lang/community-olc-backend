'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bookmark = sequelize.define('Bookmark', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    requirement_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'bookmarks',
    underscored: true,
    timestamps: false,
  });

  Bookmark.associate = (models) => {
    Bookmark.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Bookmark.belongsTo(models.Requirement, { foreignKey: 'requirement_id', as: 'requirement' });
  };

  return Bookmark;
};
