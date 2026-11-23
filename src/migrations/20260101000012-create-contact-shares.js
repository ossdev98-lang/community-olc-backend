'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contact_shares', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      conversation_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      shared_by_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      contact_name: { type: Sequelize.STRING, allowNull: false },
      contact_mobile: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('contact_shares', ['conversation_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('contact_shares');
  },
};
