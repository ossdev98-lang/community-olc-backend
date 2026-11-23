const { Sequelize } = require('sequelize');
const config = require('./env');

let databaseUrl;
if (config.db.url) {
  databaseUrl = config.db.url;
} else {
  databaseUrl = `postgres://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`;
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully.');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDatabase };
