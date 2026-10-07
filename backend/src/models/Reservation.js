const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ShiftSlot = require('./ShiftSlot');

const Reservation = sequelize.define('Reservation', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    shiftSlotId: { type: DataTypes.INTEGER, allowNull: false },
    firstName: { type: DataTypes.STRING(80), allowNull: false },
    lastName: { type: DataTypes.STRING(80), allowNull: false },
    email: { type: DataTypes.STRING(160), allowNull: false, validate: { isEmail: true } },
    // Numero in formato E.164 (canonico) e relativo HMAC per il flag no-show.
    phone: { type: DataTypes.STRING(20), allowNull: false },
    phoneHash: { type: DataTypes.STRING(64), allowNull: false },
    guests: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    notes: { type: DataTypes.TEXT, allowNull: true },
    source: { type: DataTypes.ENUM('online', 'backoffice'), allowNull: false, defaultValue: 'online' },
    status: { type: DataTypes.ENUM('confirmed', 'cancelled'), allowNull: false, defaultValue: 'confirmed' },
    // Presenza, impostata a mano dal titolare a turno concluso.
    attendance: { type: DataTypes.ENUM('arrived', 'late', 'no_show'), allowNull: true },
    consentAt: { type: DataTypes.DATE, allowNull: true },
    consentVersion: { type: DataTypes.STRING(20), allowNull: true },
    reminder24At: { type: DataTypes.DATE, allowNull: true },
    reminderMorningAt: { type: DataTypes.DATE, allowNull: true },
    // Esito dell'ultima notifica al cliente: sent | failed | skipped
    notificationStatus: { type: DataTypes.STRING(20), allowNull: true },
}, {
    indexes: [
        // Rete di sicurezza DB: un solo numero attivo per turno (indice unico parziale).
        {
            unique: true,
            fields: ['shiftSlotId', 'phone'],
            where: { status: 'confirmed' },
            name: 'reservations_unique_active_phone_per_slot',
        },
        { fields: ['phoneHash'] },
    ],
});

Reservation.belongsTo(ShiftSlot, { foreignKey: 'shiftSlotId', as: 'slot' });
ShiftSlot.hasMany(Reservation, { foreignKey: 'shiftSlotId', as: 'reservations' });

module.exports = Reservation;
