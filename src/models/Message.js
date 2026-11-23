'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversation_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_user_id: { type: DataTypes.INTEGER, allowNull: false },
    message_type: { type: DataTypes.ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'QUOTATION', 'SYSTEM'), defaultValue: 'TEXT' },
    message_text: { type: DataTypes.TEXT },
    attachment_path: { type: DataTypes.STRING },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'messages',
    underscored: true,
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
    Message.belongsTo(models.User, { foreignKey: 'sender_user_id', as: 'sender' });
  };

  return Message;
};
