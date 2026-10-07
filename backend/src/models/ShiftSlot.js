const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { SHIFT_CAPACITY } = require('../utils/shifts');

// Istanza concreta di un turno in una data: contiene il contatore dei coperti
// che viene letto e aggiornato DENTRO la transazione di prenotazione (lock di capienza).
const ShiftSlot = sequelize.define('ShiftSlot', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.STRING(5), allowNull: false },
    name: { type: DataTypes.STRING(60), allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: SHIFT_CAPACITY },
    bookedCovers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
    indexes: [{ unique: true, fields: ['date', 'startTime'] }],
});

module.exports = ShiftSlot;
