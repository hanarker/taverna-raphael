const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { menuUpload } = require('../middlewares/upload.middleware');

router.get('/', menuController.getMenuPdf);

router.post('/', authMiddleware, menuUpload.single('file'), menuController.uploadMenuPdf);

router.delete('/', authMiddleware, menuController.deleteMenuPdf);

module.exports = router;