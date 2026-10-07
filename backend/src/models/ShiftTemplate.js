const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Turno ricorrente per giorno della settimana (0 = domenica ... 6 = sabato).
// Un giorno senza template è chiuso (es. lunedì).
const ShiftTemplate = sequelize.define('ShiftTemplate', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    weekday: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 6 } },
    name: { type: DataTypes.STRING(60), allowNull: false },
    startTime: { type: DataTypes.STRING(5), allowNull: false },
});

module.exports = ShiftTemplate;
