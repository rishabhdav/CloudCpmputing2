const multer = require('multer');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const maxFileSize = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, and PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

module.exports = upload;
