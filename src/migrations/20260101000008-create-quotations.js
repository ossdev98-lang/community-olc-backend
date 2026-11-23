'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      conversation_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      sender_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      product_name: { type: Sequelize.STRING, allowNull: false },
      model_number: { type: Sequelize.STRING },
      available_quantity: { type: Sequelize.INTEGER, defaultValue: 0 },
      price: { type: Sequelize.DECIMAL(12, 2) },
      condition: { type: Sequelize.STRING },
      warranty: { type: Sequelize.STRING },
      message: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('quotations', ['conversation_id']);
    await queryInterface.addIndex('quotations', ['sender_user_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('quotations');
  },
};
