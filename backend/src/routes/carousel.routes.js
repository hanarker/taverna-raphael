const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carousel.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { carouselUpload } = require('../middlewares/upload.middleware');

router.get('/', carouselController.getCarouselImages);

router.post('/', authMiddleware, carouselUpload.single('file'), carouselController.uploadCarouselImage);

router.put('/reorder', authMiddleware, carouselController.reorderCarouselImages);

router.delete('/:id', authMiddleware, carouselController.deleteCarouselImage);

module.exports = router;