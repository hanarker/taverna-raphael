const { Op } = require('sequelize');
const ShiftSlot = require('../models/ShiftSlot');
const Reservation = require('../models/Reservation');
const NotificationLog = require('../models/NotificationLog');
const StatsDaily = require('../models/StatsDaily');
const { runAtomic } = require('./atomic');
const { romeInstant, toISODate, weekdayOf, MS_PER_DAY, MS_PER_MINUTE } = require('../utils/time');
const { SHIFT_DURATION_MINUTES } = require('../utils/shifts');

const RETENTION_DAYS = 30;

// Somma anonima di un turno: nessun campo riferibile al cliente.
function summarize(reservations) {
    const confirmed = reservations.filter((r) => r.status === 'confirmed');
    const noShows = confirmed.filter((r) => r.attendance === 'no_show');
    return {
        reservations: confirmed.length,
        covers: confirmed.reduce((sum, r) => sum + r.guests, 0),
        noShows: noShows.length,
        noShowCovers: noShows.reduce((sum, r) => sum + r.guests, 0),
    };
}

async function addToStats(slot, summary, transaction) {
    if (summary.reservations === 0) return;
    const existing = await StatsDaily.findOne({ where: { date: slot.date, startTime: slot.startTime }, transaction });
    if (!existing) {
        await StatsDaily.create({
            date: slot.date, weekday: weekdayOf(slot.date), startTime: slot.startTime, shiftName: slot.name, ...summary,
        }, { transaction });
        return;
    }
    await existing.update({
        reservations: existing.reservations + summary.reservations,
        covers: existing.covers + summary.covers,
        noShows: existing.noShows + summary.noShows,
        noShowCovers: existing.noShowCovers + summary.noShowCovers,
    }, { transaction });
}

// 1) individua i turni conclusi da oltre 30 giorni, 2) somma i dati nelle tabelle di aggregazione anonime,
// 3) cancella definitivamente (hard delete) le prenotazioni sorgente. Tutto in un'unica transazione.
async function runRetention(now = new Date()) {
    const cutoffMs = now.getTime() - RETENTION_DAYS * MS_PER_DAY;
    const cutoffDate = toISODate(new Date(cutoffMs));

    return runAtomic(async (transaction) => {
        const candidates = await ShiftSlot.findAll({ where: { date: { [Op.lte]: cutoffDate } }, transaction });
        const expired = candidates.filter(
            (slot) => romeInstant(slot.date, slot.startTime).getTime() + SHIFT_DURATION_MINUTES * MS_PER_MINUTE < cutoffMs);

        let deletedReservations = 0;
        let aggregatedSlots = 0;
        for (const slot of expired) {
            const reservations = await Reservation.findAll({ where: { shiftSlotId: slot.id }, transaction });
            const summary = summarize(reservations);
            await addToStats(slot, summary, transaction);
            if (summary.reservations > 0) aggregatedSlots += 1;

            const ids = reservations.map((r) => r.id);
            if (ids.length > 0) {
                await NotificationLog.destroy({ where: { reservationId: ids }, transaction });
                await Reservation.destroy({ where: { id: ids }, transaction });
            }
            await slot.destroy({ transaction });
            deletedReservations += ids.length;
        }
        return { deletedReservations, aggregatedSlots };
    });
}

module.exports = { runRetention, RETENTION_DAYS };
