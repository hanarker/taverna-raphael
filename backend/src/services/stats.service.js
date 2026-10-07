const { Op } = require('sequelize');
const Reservation = require('../models/Reservation');
const ShiftSlot = require('../models/ShiftSlot');
const StatsDaily = require('../models/StatsDaily');
const { aggregateStats } = require('./stats.rules');

// Statistiche = prenotazioni ancora presenti (entro 30 giorni) + aggregati anonimi storici.
// Le due sorgenti sono disgiunte: la retention sposta i dati dall'una all'altra in un'unica transazione.
async function getStats(from, to) {
    const dateRange = { [Op.between]: [from, to] };

    const live = await Reservation.findAll({
        where: { status: 'confirmed' },
        include: [{ model: ShiftSlot, as: 'slot', where: { date: dateRange } }],
    });
    const liveBySlot = new Map();
    for (const r of live) {
        const key = `${r.slot.date}|${r.slot.startTime}`;
        const current = liveBySlot.get(key) ?? {
            date: r.slot.date, startTime: r.slot.startTime, shiftName: r.slot.name, reservations: 0, covers: 0, noShows: 0,
        };
        liveBySlot.set(key, {
            ...current,
            reservations: current.reservations + 1,
            covers: current.covers + r.guests,
            noShows: current.noShows + (r.attendance === 'no_show' ? 1 : 0),
        });
    }

    const historical = await StatsDaily.findAll({ where: { date: dateRange }, raw: true });
    return { from, to, ...aggregateStats([...liveBySlot.values(), ...historical]) };
}

module.exports = { getStats };
