'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/env');
const dbConfig = require('../config/database');

const db = {};
const sequelize = dbConfig.sequelize;

const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return file !== 'index.js' && file.endsWith('.js');
});

for (const file of modelFiles) {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
