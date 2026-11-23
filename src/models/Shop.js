'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shop = sequelize.define('Shop', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    shop_name: { type: DataTypes.STRING, allowNull: false },
    owner_name: { type: DataTypes.STRING, allowNull: false },
    business_type: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    mobile: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    pincode: { type: DataTypes.STRING },
    logo: { type: DataTypes.STRING },
    business_documents: { type: DataTypes.STRING },
    specializations: { type: DataTypes.JSON, defaultValue: [] },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    approval_status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'), defaultValue: 'PENDING' },
  }, {
    tableName: 'shops',
    underscored: true,
  });

  Shop.associate = (models) => {
    Shop.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Shop.hasMany(models.Requirement, { foreignKey: 'shop_id', as: 'requirements' });
    Shop.hasMany(models.Conversation, { foreignKey: 'owner_user_id', as: 'ownedConversations' });
    Shop.hasMany(models.Conversation, { foreignKey: 'interested_user_id', as: 'interestedConversations' });
  };

  return Shop;
};
