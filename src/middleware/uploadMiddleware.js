const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const uploadDirs = {
  logos: path.resolve(config.upload.dir, 'logos'),
  documents: path.resolve(config.upload.dir, 'documents'),
  requirements: path.resolve(config.upload.dir, 'requirements'),
  chat: path.resolve(config.upload.dir, 'chat'),
};
Object.values(uploadDirs).forEach(ensureDir);

function storageFor(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDirs[folder] || uploadDirs.requirements),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
      cb(null, name);
    },
  });
}

function fileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`));
  };
}

const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const documentTypes = [...imageTypes, 'application/pdf'];

const uploadLogo = multer({ storage: storageFor('logos'), limits: { fileSize: config.upload.maxFileSize }, fileFilter: fileFilter(imageTypes) });
const uploadDocument = multer({ storage: storageFor('documents'), limits: { fileSize: config.upload.maxFileSize }, fileFilter: fileFilter(documentTypes) });
const uploadRequirementImages = multer({ storage: storageFor('requirements'), limits: { fileSize: config.upload.maxFileSize }, fileFilter: fileFilter(imageTypes) });
const uploadChat = multer({ storage: storageFor('chat'), limits: { fileSize: config.upload.maxFileSize }, fileFilter: fileFilter(documentTypes) });

function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large', errors: [] });
    return res.status(400).json({ success: false, message: err.message, errors: [] });
  }
  if (err) return res.status(400).json({ success: false, message: err.message, errors: [] });
  next();
}

const fileUrl = (req, folder, filename) => {
  const base = config.frontendUrl || `http://localhost:${config.port}`;
  return `${base}/uploads/${folder}/${filename}`;
};

module.exports = {
  uploadLogo,
  uploadDocument,
  uploadRequirementImages,
  uploadChat,
  uploadErrorHandler,
  fileUrl,
  uploadDirs,
};
