const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Flag persistente per numero, conservato come HMAC (mai il numero in chiaro).
// Sopravvive alla retention di 30 giorni: è l'unico dato residuo riferito a un cliente
// (pseudonimizzato) e va citato nell'informativa privacy.
const NoShowFlag = sequelize.define('NoShowFlag', {
    phoneHash: { type: DataTypes.STRING(64), primaryKey: true },
    flaggedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = NoShowFlag;
