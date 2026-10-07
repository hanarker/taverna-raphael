const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Setting = sequelize.define('Setting', {
    key: { type: DataTypes.STRING(60), primaryKey: true },
    value: { type: DataTypes.JSON, allowNull: false },
});

module.exports = Setting;
