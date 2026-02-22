const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const multer = require('multer');
const { fileTypeFromFile } = require('file-type');

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpeg|jpg|webp)$/.test(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error('Only image files are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

async function validateImageFile(req, res, next) {
  if (!req.file) return next();

  try {
    const detected = await fileTypeFromFile(req.file.path);
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];

    if (!detected || !allowed.includes(detected.mime)) {
      await fsPromises.unlink(req.file.path);
      req.flash('error', 'Only PNG, JPEG, or WebP images are allowed.');
      return res.redirect(req.get('referer') || '/admin/dashboard');
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  upload,
  validateImageFile,
};
