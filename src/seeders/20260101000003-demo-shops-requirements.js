'use strict';

const bcrypt = require('bcryptjs');

const shops = [
  {
    user_name: 'Parmanand Sharma',
    user_email: 'parmanand@techzone.in',
    user_mobile: '9876543210',
    user_password: 'password123',
    shop_name: 'TechZone Computer Store',
    owner_name: 'Parmanand Sharma',
    business_type: 'Laptop & Computer Retailer',
    description: 'Premium laptop and computer hardware dealer with 10+ years of experience.',
    mobile: '9876543210',
    email: 'parmanand@techzone.in',
    address: 'Shop 12, IT Market, Malviya Nagar, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    is_verified: true,
    approval_status: 'APPROVED',
    specializations: ['Laptop Parts', 'RAM & SSD', 'Motherboards'],
  },
  {
    user_name: 'Rajesh Kumar',
    user_email: 'rajesh@digitalhub.in',
    user_mobile: '9812345678',
    user_password: 'password123',
    shop_name: 'Digital Hub Solutions',
    owner_name: 'Rajesh Kumar',
    business_type: 'Computer Hardware Wholesaler',
    description: 'Wholesale supplier of computer hardware components. Bulk orders welcome.',
    mobile: '9812345678',
    email: 'rajesh@digitalhub.in',
    address: 'Nehru Place, New Delhi',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110019',
    is_verified: true,
    approval_status: 'APPROVED',
    specializations: ['Processors', 'Motherboards', 'Desktop Parts'],
  },
  {
    user_name: 'Suresh Patel',
    user_email: 'suresh@laptopcare.in',
    user_mobile: '9988776655',
    user_password: 'password123',
    shop_name: 'Laptop Care Center',
    owner_name: 'Suresh Patel',
    business_type: 'Laptop Repair & Service',
    description: 'Expert laptop repair and spare parts supplier.',
    mobile: '9988776655',
    email: 'suresh@laptopcare.in',
    address: 'CG Road, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
    is_verified: true,
    approval_status: 'APPROVED',
    specializations: ['Displays', 'Chargers', 'Laptop Parts'],
  },
  {
    user_name: 'Amit Singh',
    user_email: 'amit@bytemasters.in',
    user_mobile: '9765432109',
    user_password: 'password123',
    shop_name: 'Byte Masters',
    owner_name: 'Amit Singh',
    business_type: 'Computer Accessories Retailer',
    description: 'Complete range of computer accessories and networking equipment.',
    mobile: '9765432109',
    email: 'amit@bytemasters.in',
    address: 'Lamington Road, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400004',
    is_verified: false,
    approval_status: 'APPROVED',
    specializations: ['Accessories', 'Networking', 'Printers'],
  },
  {
    user_name: 'Venkat Rao',
    user_email: 'venkat@pcworld.in',
    user_mobile: '9654321098',
    user_password: 'password123',
    shop_name: 'PC World Hyderabad',
    owner_name: 'Venkat Rao',
    business_type: 'Computer Hardware Retailer',
    description: 'Trusted computer hardware retailer serving Hyderabad for 8 years.',
    mobile: '9654321098',
    email: 'venkat@pcworld.in',
    address: 'Abids, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    is_verified: true,
    approval_status: 'APPROVED',
    specializations: ['RAM & SSD', 'Processors', 'Desktop Parts'],
  },
  {
    user_name: 'Priya Mehta',
    user_email: 'priya@infotech.in',
    user_mobile: '9543210987',
    user_password: 'password123',
    shop_name: 'InfoTech Supplies',
    owner_name: 'Priya Mehta',
    business_type: 'IT Equipment Supplier',
    description: 'B2B IT equipment and supplies for businesses.',
    mobile: '9543210987',
    email: 'priya@infotech.in',
    address: 'FC Road, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411005',
    is_verified: true,
    approval_status: 'APPROVED',
    specializations: ['Networking', 'Printers', 'Accessories'],
  },
  {
    user_name: 'Kiran Reddy',
    user_email: 'kiran@sparehub.in',
    user_mobile: '9432109876',
    user_password: 'password123',
    shop_name: 'SpareHub India',
    owner_name: 'Kiran Reddy',
    business_type: 'Spare Parts Supplier',
    description: 'Largest spare parts supplier in South India.',
    mobile: '9432109876',
    email: 'kiran@sparehub.in',
    address: 'SP Road, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560002',
    is_verified: true,
    approval_status: 'APPROVED',
    specializations: ['Laptop Parts', 'Displays', 'Chargers'],
  },
  {
    user_name: 'Manish Gupta',
    user_email: 'manish@techfix.in',
    user_mobile: '9210987654',
    user_password: 'password123',
    shop_name: 'TechFix Solutions',
    owner_name: 'Manish Gupta',
    business_type: 'Laptop Repair & Service',
    description: 'Professional laptop repair center.',
    mobile: '9210987654',
    email: 'manish@techfix.in',
    address: 'Anna Salai, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600002',
    is_verified: false,
    approval_status: 'PENDING',
    specializations: ['Laptop Parts', 'Displays'],
  },
];

const requirements = [
  {
    shop_name: 'Digital Hub Solutions',
    title: 'Need HP Pavilion 15 Display Panel 15.6" FHD',
    product_name: 'HP Pavilion 15 Display',
    category: 'Displays',
    model_number: 'HP-PAV15-FHD-2023',
    description: 'Looking for original HP Pavilion 15 FHD display panel. Need 5 units urgently. Must be original, not compatible. Preferred brands: BOE, AUO, LG.',
    quantity: 5,
    condition: 'NEW',
    expected_price: '\u20B93,500 - \u20B94,200 per unit',
    location: 'Delhi',
    city: 'Delhi',
    state: 'Delhi',
    status: 'ACTIVE',
    duration_hours: 24,
  },
  {
    shop_name: 'Laptop Care Center',
    title: 'Dell Inspiron 14 Battery 3-Cell 42Wh Required',
    product_name: 'Dell Inspiron 14 Battery',
    category: 'Laptop Parts',
    model_number: 'DELL-INS14-BAT-42WH',
    description: 'Need Dell Inspiron 14 3-cell 42Wh battery. Model 3451/3452/3458. Minimum 10 units. OEM preferred.',
    quantity: 10,
    condition: 'NEW',
    expected_price: '\u20B91,800 - \u20B92,200 per unit',
    location: 'Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    status: 'ACTIVE',
    duration_hours: 24,
  },
  {
    shop_name: 'PC World Hyderabad',
    title: 'Samsung 8GB DDR4 2666MHz RAM Modules',
    product_name: 'Samsung 8GB DDR4 RAM',
    category: 'RAM & SSD',
    model_number: 'SAM-8GB-DDR4-2666',
    description: 'Bulk requirement for Samsung 8GB DDR4 2666MHz SO-DIMM modules. Need 50 units. Must be original Samsung, not OEM.',
    quantity: 50,
    condition: 'NEW',
    expected_price: '\u20B91,600 - \u20B91,900 per unit',
    location: 'Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    status: 'ACTIVE',
    duration_hours: 48,
  },
  {
    shop_name: 'SpareHub India',
    title: 'Lenovo ThinkPad X1 Carbon Keyboard Replacement',
    product_name: 'ThinkPad X1 Carbon Keyboard',
    category: 'Laptop Parts',
    model_number: 'LEN-X1C-KB-GEN9',
    description: 'Need ThinkPad X1 Carbon Gen 9 keyboard with backlight. US layout. 3 units required.',
    quantity: 3,
    condition: 'NEW',
    expected_price: '\u20B94,500 - \u20B95,500 per unit',
    location: 'Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    status: 'ACTIVE',
    duration_hours: 24,
  },
  {
    shop_name: 'Byte Masters',
    title: 'TP-Link 8-Port Gigabit Switch TL-SG108',
    product_name: 'TP-Link TL-SG108',
    category: 'Networking',
    model_number: 'TP-SG108-V6',
    description: 'Need 20 units of TP-Link 8-port gigabit unmanaged switch. Latest version preferred.',
    quantity: 20,
    condition: 'NEW',
    expected_price: '\u20B91,200 - \u20B91,400 per unit',
    location: 'Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    status: 'ACTIVE',
    duration_hours: 24,
  },
  {
    shop_name: 'InfoTech Supplies',
    title: 'Intel Core i5-12400 Processor Bulk Order',
    product_name: 'Intel Core i5-12400',
    category: 'Processors',
    model_number: 'INTEL-I5-12400-BOX',
    description: 'Looking for Intel Core i5-12400 boxed processors. Need 15 units. Must be genuine Intel box with warranty.',
    quantity: 15,
    condition: 'NEW',
    expected_price: '\u20B914,000 - \u20B915,500 per unit',
    location: 'Pune',
    city: 'Pune',
    state: 'Maharashtra',
    status: 'ACTIVE',
    duration_hours: 72,
  },
  {
    shop_name: 'TechZone Computer Store',
    title: 'ASUS ROG Strix G15 Cooling Fan Assembly',
    product_name: 'ASUS ROG G15 Fan',
    category: 'Laptop Parts',
    model_number: 'ASUS-ROG-G15-FAN-2022',
    description: 'Need cooling fan assembly for ASUS ROG Strix G15 2022 model. 2 units required. Must be original.',
    quantity: 2,
    condition: 'NEW',
    expected_price: '\u20B92,800 - \u20B93,500 per unit',
    location: 'Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    status: 'ACTIVE',
    duration_hours: 24,
  },
  {
    shop_name: 'Digital Hub Solutions',
    title: 'WD Blue 1TB SSD SATA 2.5" — 30 Units',
    product_name: 'WD Blue 1TB SSD',
    category: 'RAM & SSD',
    model_number: 'WD-BLUE-1TB-SATA',
    description: 'Bulk requirement for WD Blue 1TB SATA SSD. 30 units. Must be original WD with full warranty.',
    quantity: 30,
    condition: 'NEW',
    expected_price: '\u20B95,500 - \u20B96,200 per unit',
    location: 'Delhi',
    city: 'Delhi',
    state: 'Delhi',
    status: 'ACTIVE',
    duration_hours: 48,
  },
  {
    shop_name: 'Laptop Care Center',
    title: 'MacBook Pro 13 M1 Charger 61W USB-C',
    product_name: 'MacBook Pro 61W Charger',
    category: 'Chargers',
    model_number: 'APPLE-61W-USBC',
    description: 'Need Apple 61W USB-C charger for MacBook Pro 13 M1. 5 units.',
    quantity: 5,
    condition: 'NEW',
    expected_price: '\u20B93,200 - \u20B93,800 per unit',
    location: 'Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    status: 'EXPIRED',
    duration_hours: 24,
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hour = 3600000;

    const createdShops = [];

    for (const shop of shops) {
      const passwordHash = await bcrypt.hash(shop.user_password, 10);
      const [user] = await queryInterface.sequelize.query(
        `INSERT INTO users (name, email, mobile, password, role, status, is_verified, created_at, updated_at)
         VALUES (:name, :email, :mobile, :password, 'MEMBER', 'APPROVED', true, :now, :now)
         RETURNING id`,
        { replacements: { name: shop.user_name, email: shop.user_email, mobile: shop.user_mobile, password: passwordHash, now: now }, type: queryInterface.sequelize.QueryTypes.INSERT }
      );
      const userId = user[0].id;

      const specsJson = JSON.stringify(shop.specializations);
      const [createdShop] = await queryInterface.sequelize.query(
        `INSERT INTO shops (user_id, shop_name, owner_name, business_type, description, mobile, email, address, city, state, pincode, is_verified, approval_status, specializations, created_at, updated_at)
         VALUES (:user_id, :shop_name, :owner_name, :business_type, :description, :mobile, :email, :address, :city, :state, :pincode, :is_verified, :approval_status, CAST(:specializations AS json), :now, :now)
         RETURNING id`,
        {
          replacements: {
            user_id: userId, shop_name: shop.shop_name, owner_name: shop.owner_name,
            business_type: shop.business_type, description: shop.description, mobile: shop.mobile,
            email: shop.email, address: shop.address, city: shop.city, state: shop.state,
            pincode: shop.pincode, is_verified: shop.is_verified, approval_status: shop.approval_status,
            specializations: specsJson, now: now,
          },
          type: queryInterface.sequelize.QueryTypes.INSERT,
        }
      );
      createdShops.push({ ...shop, id: createdShop[0].id, userId });
    }

    const shopByName = {};
    for (const s of createdShops) shopByName[s.shop_name] = s;

    const categoryByName = {};
    const cats = await queryInterface.sequelize.query(`SELECT id, name FROM categories`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    for (const c of cats) categoryByName[c.name] = c.id;

    const createdUsers = createdShops.map(s => ({ id: s.userId, email: s.user_email }));

    const createdReqs = [];
    for (const req of requirements) {
      const shop = shopByName[req.shop_name];
      const user = createdUsers.find(u => u.email === shop.user_email);
      const categoryId = categoryByName[req.category] || null;
      const expiresAt = new Date(now.getTime() + req.duration_hours * hour);
      let status = req.status;
      if (status === 'ACTIVE' && expiresAt <= now) status = 'EXPIRED';

      const [createdReq] = await queryInterface.sequelize.query(
        `INSERT INTO requirements (user_id, shop_id, category_id, title, product_name, model_number, part_name, description, quantity, condition, expected_price, location, city, state, status, published_at, expires_at, closed_at, duration_hours, created_at, updated_at)
         VALUES (:user_id, :shop_id, :category_id, :title, :product_name, :model_number, :part_name, :description, :quantity, :condition, :expected_price, :location, :city, :state, :status, :now, :expires_at, NULL, :duration_hours, :now, :now)
         RETURNING id`,
        {
          replacements: {
            user_id: user.id, shop_id: shop.id, category_id: categoryId, title: req.title,
            product_name: req.product_name, model_number: req.model_number, part_name: null,
            description: req.description, quantity: req.quantity, condition: req.condition,
            expected_price: req.expected_price, location: req.location, city: req.city, state: req.state,
            status, expires_at: expiresAt, duration_hours: req.duration_hours, now: now,
          },
          type: queryInterface.sequelize.QueryTypes.INSERT,
        }
      );
      createdReqs.push({ ...req, id: createdReq[0].id, shopId: shop.id });
    }

    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    await queryInterface.sequelize.query(
      `UPDATE requirements SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND expires_at <= :dayStart`,
      { replacements: { dayStart: dayStart }, type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    const techZone = createdShops.find(s => s.shop_name === 'TechZone Computer Store');
    await queryInterface.bulkInsert('notifications', [
      {
        user_id: techZone.id,
        type: 'shop_approved',
        title: 'Shop Approved',
        message: 'Your shop "TechZone Computer Store" has been approved by admin',
        is_read: true,
        related_type: 'shop',
        created_at: now,
      },
    ], {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('requirements', null, {});
    await queryInterface.bulkDelete('shops', null, {});
    await queryInterface.bulkDelete('users', { role: 'MEMBER' }, {});
  },
};
