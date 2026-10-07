const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Aggregato ANONIMO di prenotazioni ormai cancellate: nessuna colonna identificativa.
const StatsDaily = sequelize.define('StatsDaily', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    weekday: { type: DataTypes.INTEGER, allowNull: false },
    startTime: { type: DataTypes.STRING(5), allowNull: false },
    shiftName: { type: DataTypes.STRING(60), allowNull: false },
    reservations: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    covers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    noShows: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    noShowCovers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
    indexes: [{ unique: true, fields: ['date', 'startTime'] }],
});

module.exports = StatsDaily;
