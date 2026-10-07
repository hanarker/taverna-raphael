const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SiteAsset = sequelize.define('SiteAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('menu_pdf', 'carousel_image'),
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'SiteAssets',
  timestamps: true
});

module.exports = SiteAsset;