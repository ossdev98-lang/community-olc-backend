'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otp_verifications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING },
      mobile: { type: Sequelize.STRING },
      otp: { type: Sequelize.STRING, allowNull: false },
      purpose: { type: Sequelize.ENUM('REGISTER', 'FORGOT_PASSWORD', 'VERIFY_LOGIN'), defaultValue: 'REGISTER' },
      is_used: { type: Sequelize.BOOLEAN, defaultValue: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('otp_verifications', ['email']);
    await queryInterface.addIndex('otp_verifications', ['mobile']);
    await queryInterface.addIndex('otp_verifications', ['expires_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('otp_verifications');
  },
};
