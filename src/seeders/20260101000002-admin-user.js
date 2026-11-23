'use strict';

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminName = process.env.ADMIN_NAME || 'System Admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ozonelap.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminMobile = process.env.ADMIN_MOBILE || '9000000000';

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const [adminUser] = await queryInterface.sequelize.query(
      `INSERT INTO users (name, email, mobile, password, role, status, is_verified, created_at, updated_at)
       VALUES (:name, :email, :mobile, :password, 'ADMIN', 'APPROVED', true, :now, :now)
       RETURNING id`,
      { replacements: { name: adminName, email: adminEmail, mobile: adminMobile, password: passwordHash, now: new Date() }, type: queryInterface.sequelize.QueryTypes.INSERT }
    );
    const adminUserId = adminUser[0].id;

    await queryInterface.bulkInsert('shops', [{
      user_id: adminUserId,
      shop_name: 'Ozone Lapcare Admin',
      owner_name: adminName,
      business_type: 'IT Equipment Supplier',
      description: 'Platform administrator account.',
      mobile: adminMobile,
      email: adminEmail,
      address: 'Head Office',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      is_verified: true,
      approval_status: 'APPROVED',
      specializations: Sequelize.literal("'[]'::json"),
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('shops', { user_id: 1 }, {});
    await queryInterface.bulkDelete('users', { email: process.env.ADMIN_EMAIL || 'admin@ozonelap.in' }, {});
  },
};
