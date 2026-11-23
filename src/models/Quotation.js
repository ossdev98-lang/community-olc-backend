'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quotation = sequelize.define('Quotation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversation_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_name: { type: DataTypes.STRING, allowNull: false },
    model_number: { type: DataTypes.STRING },
    available_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    price: { type: DataTypes.DECIMAL(12, 2) },
    condition: { type: DataTypes.STRING },
    warranty: { type: DataTypes.STRING },
    message: { type: DataTypes.TEXT },
  }, {
    tableName: 'quotations',
    underscored: true,
  });

  Quotation.associate = (models) => {
    Quotation.belongsTo(models.Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
    Quotation.belongsTo(models.User, { foreignKey: 'sender_user_id', as: 'sender' });
  };

  return Quotation;
};
