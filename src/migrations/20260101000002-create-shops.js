'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shops', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      shop_name: { type: Sequelize.STRING, allowNull: false },
      owner_name: { type: Sequelize.STRING, allowNull: false },
      business_type: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      mobile: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      address: { type: Sequelize.TEXT },
      city: { type: Sequelize.STRING },
      state: { type: Sequelize.STRING },
      pincode: { type: Sequelize.STRING },
      logo: { type: Sequelize.STRING },
      business_documents: { type: Sequelize.STRING },
      specializations: { type: Sequelize.JSON, defaultValue: [] },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      approval_status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'), defaultValue: 'PENDING' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('shops', ['user_id']);
    await queryInterface.addIndex('shops', ['approval_status']);
    await queryInterface.addIndex('shops', ['city']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('shops');
  },
};
