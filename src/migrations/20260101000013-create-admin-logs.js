'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      admin_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      action: { type: Sequelize.STRING, allowNull: false },
      entity_type: { type: Sequelize.STRING },
      entity_id: { type: Sequelize.INTEGER },
      details: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('admin_logs', ['admin_user_id']);
    await queryInterface.addIndex('admin_logs', ['created_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('admin_logs');
  },
};
