const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Eccezione per una data specifica: se esiste almeno un override per la data,
// l'insieme degli override SOSTITUISCE i template di quel giorno.
// isClosed = true → giornata chiusa (name/startTime non usati).
const ShiftOverride = sequelize.define('ShiftOverride', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    name: { type: DataTypes.STRING(60), allowNull: true },
    startTime: { type: DataTypes.STRING(5), allowNull: true },
    isClosed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

module.exports = ShiftOverride;
