'use strict';

const categories = [
  { name: 'Laptop Parts', label: 'Laptop Parts', icon: 'Laptop', is_active: true },
  { name: 'Desktop Parts', label: 'Desktop Parts', icon: 'Monitor', is_active: true },
  { name: 'RAM & SSD', label: 'RAM & SSD', icon: 'MemoryStick', is_active: true },
  { name: 'Motherboards', label: 'Motherboards', icon: 'CircuitBoard', is_active: true },
  { name: 'Displays', label: 'Displays', icon: 'Tv', is_active: true },
  { name: 'Chargers', label: 'Chargers', icon: 'Zap', is_active: true },
  { name: 'Processors', label: 'Processors', icon: 'Cpu', is_active: true },
  { name: 'Accessories', label: 'Accessories', icon: 'Package', is_active: true },
  { name: 'Printers', label: 'Printers', icon: 'Printer', is_active: true },
  { name: 'Networking', label: 'Networking', icon: 'Wifi', is_active: true },
  { name: 'Other', label: 'Other', icon: 'MoreHorizontal', is_active: true },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', categories.map((c) => ({
      ...c,
      created_at: new Date(),
      updated_at: new Date(),
    })), {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
