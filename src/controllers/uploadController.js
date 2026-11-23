const { success, error } = require('../utils/responseHandler');

async function serveUpload(req, res) {
  try {
    const { folder, filename } = req.params;
    const allowed = ['logos', 'documents', 'requirements', 'chat'];
    if (!allowed.includes(folder)) return error(res, 'Invalid folder', 400);
    const path = require('path');
    const fs = require('fs');
    const filePath = path.resolve(process.env.UPLOAD_DIR || './uploads', folder, filename);
    if (!fs.existsSync(filePath)) return error(res, 'File not found', 404);
    res.sendFile(filePath);
  } catch (err) {
    return error(res, err.message || 'Failed to serve file', 500);
  }
}

module.exports = { serveUpload };
