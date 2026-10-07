const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Public
router.get('/', newsController.getAllNews);
router.get('/:slug', newsController.getNewsBySlug);

// Admin only
router.post('/', verifyToken, newsController.createNews);
router.put('/:id', verifyToken, newsController.updateNews);
router.delete('/:id', verifyToken, newsController.deleteNews);

module.exports = router;
