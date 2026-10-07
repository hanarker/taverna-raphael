const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const News = sequelize.define('News', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true, // URL to image
    },
    publishedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
});

module.exports = News;
