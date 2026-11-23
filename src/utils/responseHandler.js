function success(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function error(res, message, statusCode = 400, errors = []) {
  return res.status(statusCode).json({ success: false, message, errors });
}

function paginate(data, page, limit) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(Math.min(parseInt(limit, 10) || 20, 100), 1);
  const offset = (p - 1) * l;
  const rows = data.slice(offset, offset + l);
  return {
    rows,
    total: data.length,
    page: p,
    limit: l,
    totalPages: Math.ceil(data.length / l),
  };
}

module.exports = { success, error, paginate };
