function paginateQuery(page, limit) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(Math.min(parseInt(limit, 10) || 20, 100), 1);
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
}

module.exports = { paginateQuery };
