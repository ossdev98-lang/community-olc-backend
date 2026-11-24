'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('bookmarks');
    if (!columns.created_at) {
      await queryInterface.addColumn('bookmarks', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('bookmarks');
    if (columns.created_at) await queryInterface.removeColumn('bookmarks', 'created_at');
  },
};
