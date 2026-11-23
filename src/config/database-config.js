require('dotenv').config();

function dbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  return `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'olc_community'}`;
}

module.exports = {
  development: {
    url: dbUrl(),
    dialect: 'postgres',
    dialectOptions: {},
  },
  test: {
    url: dbUrl(),
    dialect: 'postgres',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
    },
  },
};
