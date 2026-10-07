const SiteAsset = require('../models/SiteAsset');
const path = require('path');
const fs = require('fs');

exports.getCarouselImages = async (req, res) => {
  try {
    const images = await SiteAsset.findAll({
      where: { type: 'carousel_image' },
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    const imagesWithUrl = images.map(img => ({
      id: img.id,
      originalName: img.originalName,
      filename: img.filename,
      sortOrder: img.sortOrder,
      imageUrl: `/uploads/carousel/${img.filename}`
    }));

    res.json(imagesWithUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero delle immagini' });
  }
};

exports.uploadCarouselImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nessun file caricato' });
    }

    const maxOrder = await SiteAsset.max('sortOrder', {
      where: { type: 'carousel_image' }
    }) || 0;

    const newImage = await SiteAsset.create({
      type: 'carousel_image',
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sortOrder: maxOrder + 1
    });

    res.status(201).json({
      id: newImage.id,
      originalName: newImage.originalName,
      filename: newImage.filename,
      sortOrder: newImage.sortOrder,
      imageUrl: `/uploads/carousel/${newImage.filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel caricamento dell\'immagini' });
  }
};

exports.reorderCarouselImages = async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: 'Array di ordinamento non valido' });
    }

    for (let i = 0; i < order.length; i++) {
      await SiteAsset.update(
        { sortOrder: i + 1 },
        { where: { id: order[i], type: 'carousel_image' } }
      );
    }

    res.json({ message: 'Ordine aggiornato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nell\'ordinamento delle immagini' });
  }
};

exports.deleteCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await SiteAsset.findOne({
      where: { id, type: 'carousel_image' }
    });

    if (!image) {
      return res.status(404).json({ message: 'Immagine non trovata' });
    }

    const filePath = path.join(__dirname, '..', '..', 'uploads', 'carousel', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.destroy();

    res.json({ message: 'Immagine eliminata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nell\'eliminazione dell\'immagini' });
  }
};