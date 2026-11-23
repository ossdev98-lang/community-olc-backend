'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContactShare = sequelize.define('ContactShare', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversation_id: { type: DataTypes.INTEGER, allowNull: false },
    shared_by_user_id: { type: DataTypes.INTEGER, allowNull: false },
    contact_name: { type: DataTypes.STRING, allowNull: false },
    contact_mobile: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'contact_shares',
    underscored: true,
    timestamps: false,
  });

  ContactShare.associate = (models) => {
    ContactShare.belongsTo(models.Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
    ContactShare.belongsTo(models.User, { foreignKey: 'shared_by_user_id', as: 'sharedBy' });
  };

  return ContactShare;
};
