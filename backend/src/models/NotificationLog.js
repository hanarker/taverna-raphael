const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Registro tecnico degli invii: nessun dato personale (niente numero, nome, email).
const NotificationLog = sequelize.define('NotificationLog', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    reservationId: { type: DataTypes.INTEGER, allowNull: true },
    event: { type: DataTypes.STRING(40), allowNull: false },
    channel: { type: DataTypes.STRING(20), allowNull: false },
    status: { type: DataTypes.STRING(40), allowNull: false },
    providerSid: { type: DataTypes.STRING(64), allowNull: true },
    errorCode: { type: DataTypes.STRING(40), allowNull: true },
});

module.exports = NotificationLog;
