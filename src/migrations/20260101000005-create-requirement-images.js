'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requirement_images', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      requirement_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'requirements', key: 'id' }, onDelete: 'CASCADE' },
      image_path: { type: Sequelize.STRING, allowNull: false },
      display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('requirement_images', ['requirement_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('requirement_images');
  },
};
