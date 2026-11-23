'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      requirement_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'requirements', key: 'id' }, onDelete: 'CASCADE' },
      owner_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      interested_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.ENUM('ACTIVE', 'CLOSED'), defaultValue: 'ACTIVE' },
      last_message_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('conversations', ['requirement_id']);
    await queryInterface.addIndex('conversations', ['owner_user_id']);
    await queryInterface.addIndex('conversations', ['interested_user_id']);
    await queryInterface.addIndex('conversations', ['requirement_id', 'interested_user_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('conversations');
  },
};
