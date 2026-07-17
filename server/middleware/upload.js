const multer = require('multer');
const path = require('path');

// Allowlist of permitted MIME types: standard documents and images only.
// Executables, scripts, archives, and other potentially dangerous formats are rejected.
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']);

// Store files locally on disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

// File filter: validate both MIME type and extension to guard against
// spoofed content-type headers (e.g. a .exe disguised as image/jpeg).
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeAllowed = ALLOWED_MIME_TYPES.has(file.mimetype);
  const extAllowed = ALLOWED_EXTENSIONS.has(ext);

  if (mimeAllowed && extAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed. Only PDF and image files (JPG, PNG, GIF, WebP) are accepted. Received: ${file.mimetype}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

module.exports = upload;
