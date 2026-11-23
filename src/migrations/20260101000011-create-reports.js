'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      reporter_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      requirement_id: { type: Sequelize.INTEGER, references: { model: 'requirements', key: 'id' }, onDelete: 'SET NULL' },
      reported_user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      reason: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('PENDING', 'RESOLVED', 'DISMISSED'), defaultValue: 'PENDING' },
      admin_notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('reports', ['status']);
    await queryInterface.addIndex('reports', ['reporter_user_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('reports');
  },
};
