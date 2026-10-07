const SiteAsset = require('../models/SiteAsset');
const path = require('path');
const fs = require('fs');

exports.getMenuPdf = async (req, res) => {
  try {
    const menuPdf = await SiteAsset.findOne({
      where: { type: 'menu_pdf' }
    });

    if (!menuPdf) {
      return res.json({ pdfUrl: null });
    }

    res.json({
      pdfUrl: `/uploads/menu/${menuPdf.filename}`,
      originalName: menuPdf.originalName
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero del menu' });
  }
};

exports.uploadMenuPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nessun file caricato' });
    }

    const existingPdfs = await SiteAsset.findAll({
      where: { type: 'menu_pdf' }
    });

    for (const pdf of existingPdfs) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', 'menu', pdf.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await pdf.destroy();
    }

    const newPdf = await SiteAsset.create({
      type: 'menu_pdf',
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype
    });

    res.status(201).json({
      message: 'Menu caricato con successo',
      pdfUrl: `/uploads/menu/${newPdf.filename}`,
      originalName: newPdf.originalName
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel caricamento del menu' });
  }
};

exports.deleteMenuPdf = async (req, res) => {
  try {
    const menuPdf = await SiteAsset.findOne({
      where: { type: 'menu_pdf' }
    });

    if (!menuPdf) {
      return res.status(404).json({ message: 'Nessun menu da eliminare' });
    }

    const filePath = path.join(__dirname, '..', '..', 'uploads', 'menu', menuPdf.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await menuPdf.destroy();

    res.json({ message: 'Menu eliminato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nell\'eliminazione del menu' });
  }
};