'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requirements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      shop_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'shops', key: 'id' }, onDelete: 'CASCADE' },
      category_id: { type: Sequelize.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      title: { type: Sequelize.STRING, allowNull: false },
      product_name: { type: Sequelize.STRING, allowNull: false },
      model_number: { type: Sequelize.STRING },
      part_name: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      condition: { type: Sequelize.ENUM('NEW', 'USED', 'REFURBISHED', 'ANY'), defaultValue: 'NEW' },
      expected_price: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      state: { type: Sequelize.STRING },
      status: { type: Sequelize.ENUM('ACTIVE', 'EXPIRED', 'CLOSED', 'HIDDEN'), defaultValue: 'ACTIVE' },
      published_at: { type: Sequelize.DATE },
      expires_at: { type: Sequelize.DATE },
      closed_at: { type: Sequelize.DATE },
      duration_hours: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('requirements', ['user_id']);
    await queryInterface.addIndex('requirements', ['shop_id']);
    await queryInterface.addIndex('requirements', ['category_id']);
    await queryInterface.addIndex('requirements', ['status']);
    await queryInterface.addIndex('requirements', ['city']);
    await queryInterface.addIndex('requirements', ['expires_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('requirements');
  },
};
