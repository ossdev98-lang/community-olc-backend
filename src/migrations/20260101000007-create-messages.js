'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      conversation_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      sender_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      message_type: { type: Sequelize.ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'QUOTATION', 'SYSTEM'), defaultValue: 'TEXT' },
      message_text: { type: Sequelize.TEXT },
      attachment_path: { type: Sequelize.STRING },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('messages', ['conversation_id']);
    await queryInterface.addIndex('messages', ['sender_user_id']);
    await queryInterface.addIndex('messages', ['is_read']);
    await queryInterface.addIndex('messages', ['created_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  },
};
