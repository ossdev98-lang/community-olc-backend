'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    requirement_id: { type: DataTypes.INTEGER, allowNull: false },
    owner_user_id: { type: DataTypes.INTEGER, allowNull: false },
    interested_user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'CLOSED'), defaultValue: 'ACTIVE' },
    last_message_at: { type: DataTypes.DATE },
  }, {
    tableName: 'conversations',
    underscored: true,
  });

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.Requirement, { foreignKey: 'requirement_id', as: 'requirement' });
    Conversation.belongsTo(models.User, { foreignKey: 'owner_user_id', as: 'owner' });
    Conversation.belongsTo(models.User, { foreignKey: 'interested_user_id', as: 'interestedUser' });
    Conversation.hasMany(models.Message, { foreignKey: 'conversation_id', as: 'messages' });
    Conversation.hasMany(models.Quotation, { foreignKey: 'conversation_id', as: 'quotations' });
    Conversation.hasMany(models.ContactShare, { foreignKey: 'conversation_id', as: 'contactShares' });
  };

  return Conversation;
};
