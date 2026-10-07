const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storageMenu = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'menu'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const storageCarousel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'carousel'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilterPdf = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo file PDF sono ammessi'), false);
  }
};

const fileFilterImage = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo immagini sono ammesse'), false);
  }
};

const menuUpload = multer({
  storage: storageMenu,
  fileFilter: fileFilterPdf,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const carouselUpload = multer({
  storage: storageCarousel,
  fileFilter: fileFilterImage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { menuUpload, carouselUpload };