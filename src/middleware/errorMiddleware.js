const { error } = require('../utils/responseHandler');

function errorMiddleware(err, req, res, next) {
  console.error(err.stack || err);
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors ? err.errors.map((e) => e.path) : [];
    return error(res, 'Duplicate entry', 409, fields);
  }
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : [];
    return error(res, 'Validation error', 400, errors);
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return error(res, 'Referenced record not found', 400);
  }
  return error(res, err.message || 'Internal server error', 500);
}

module.exports = { errorMiddleware };
