'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookmarks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      requirement_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'requirements', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('bookmarks', ['user_id']);
    await queryInterface.addIndex('bookmarks', ['requirement_id']);
    await queryInterface.addIndex('bookmarks', ['user_id', 'requirement_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('bookmarks');
  },
};
