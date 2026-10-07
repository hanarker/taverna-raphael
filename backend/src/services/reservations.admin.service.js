const { Op } = require('sequelize');
const Reservation = require('../models/Reservation');
const ShiftSlot = require('../models/ShiftSlot');
const NoShowFlag = require('../models/NoShowFlag');
const { BookingError } = require('./booking.errors');
const { runAtomic } = require('./atomic');
const { resolveShiftsForDate } = require('./schedule.service');
const { notifyAvailabilityChanged } = require('./availability.events');
const { normalizePhone, hashPhone } = require('../utils/phone');
const { cleanText } = require('../utils/sanitize');
const { romeInstant } = require('../utils/time');
const { SHIFT_CAPACITY } = require('../utils/shifts');
const { toSingleLine } = require('./notifications/templates');

const ATTENDANCE_VALUES = ['arrived', 'late', 'no_show'];
const MAX_BULK_MESSAGE_LENGTH = 500;

function toRow(reservation, flaggedHashes) {
    return {
        id: reservation.id,
        firstName: reservation.firstName,
        lastName: reservation.lastName,
        email: reservation.email,
        phone: reservation.phone,
        guests: reservation.guests,
        notes: reservation.notes,
        source: reservation.source,
        status: reservation.status,
        attendance: reservation.attendance,
        notificationStatus: reservation.notificationStatus,
        createdAt: reservation.createdAt,
        hasNoShowFlag: flaggedHashes.has(reservation.phoneHash),
    };
}

// Vista giornaliera: tutti i turni della data (anche vuoti), con le prenotazioni e l'alert no-show.
async function listDay(date) {
    const shifts = await resolveShiftsForDate(date);
    const slots = await ShiftSlot.findAll({ where: { date }, include: [{ model: Reservation, as: 'reservations' }] });
    const flagged = new Set((await NoShowFlag.findAll({
        where: { phoneHash: { [Op.in]: slots.flatMap((s) => s.reservations.map((r) => r.phoneHash)) } },
    })).map((f) => f.phoneHash));

    const byStart = new Map(slots.map((slot) => [slot.startTime, slot]));
    const configured = shifts.map((shift) => ({ startTime: shift.startTime, name: shift.name }));
    const orphans = slots.filter((s) => !shifts.some((shift) => shift.startTime === s.startTime))
        .map((s) => ({ startTime: s.startTime, name: s.name }));

    return {
        date,
        shifts: [...configured, ...orphans].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(({ startTime, name }) => {
            const slot = byStart.get(startTime);
            const reservations = (slot?.reservations ?? [])
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((r) => toRow(r, flagged));
            return {
                startTime, name,
                capacity: slot?.capacity ?? SHIFT_CAPACITY,
                bookedCovers: slot?.bookedCovers ?? 0,
                reservations,
            };
        }),
    };
}

// "arrivato" e "in ritardo" si possono segnare in qualsiasi momento; "no-show" solo a turno iniziato
// e attiva il flag persistente sul numero (mai un blocco: solo un alert al titolare).
async function setAttendance(reservationId, attendance, now = new Date()) {
    if (attendance !== null && !ATTENDANCE_VALUES.includes(attendance)) {
        throw new BookingError('VALIDATION', 400, 'Presenza non valida (arrived, late, no_show).');
    }
    return runAtomic(async (transaction) => {
        const reservation = await Reservation.findByPk(reservationId, { transaction, include: [{ model: ShiftSlot, as: 'slot' }] });
        if (!reservation) throw new BookingError('NOT_FOUND', 404, 'Prenotazione non trovata.');
        if (reservation.status === 'cancelled') throw new BookingError('ALREADY_CANCELLED', 409, 'La prenotazione è annullata.');

        if (attendance === 'no_show' && romeInstant(reservation.slot.date, reservation.slot.startTime) > now) {
            throw new BookingError('NOT_STARTED', 409, 'Puoi segnare un no-show solo dopo l\'inizio del turno.');
        }
        await reservation.update({ attendance }, { transaction });
        if (attendance === 'no_show') {
            await NoShowFlag.findOrCreate({ where: { phoneHash: reservation.phoneHash }, transaction });
        }
        return reservation;
    });
}

async function setPhoneFlag({ phone, reservationId, flagged }) {
    let phoneHash;
    if (reservationId !== undefined) {
        const reservation = await Reservation.findByPk(reservationId);
        if (!reservation) throw new BookingError('NOT_FOUND', 404, 'Prenotazione non trovata.');
        phoneHash = reservation.phoneHash;
    } else {
        const e164 = normalizePhone(phone);
        if (!e164) throw new BookingError('VALIDATION', 400, 'Numero di telefono non valido (serve il prefisso internazionale).');
        phoneHash = hashPhone(e164);
    }
    if (flagged) await NoShowFlag.findOrCreate({ where: { phoneHash } });
    else await NoShowFlag.destroy({ where: { phoneHash } });
    return { flagged: Boolean(flagged) };
}

async function getPhoneFlag(phone) {
    const e164 = normalizePhone(phone);
    if (!e164) throw new BookingError('VALIDATION', 400, 'Numero di telefono non valido (serve il prefisso internazionale).');
    return { phone: e164, flagged: (await NoShowFlag.count({ where: { phoneHash: hashPhone(e164) } })) > 0 };
}

// Annulla tutte le prenotazioni attive di un turno (startTime) o di una giornata (senza startTime).
// Restituisce le prenotazioni annullate: il chiamante invia il messaggio personalizzato a ciascun cliente.
async function bulkCancel({ date, startTime, message }) {
    const cleanMessage = toSingleLine(cleanText(message, MAX_BULK_MESSAGE_LENGTH));
    if (!cleanMessage) throw new BookingError('VALIDATION', 400, 'Il messaggio di annullamento è obbligatorio.');

    const cancelled = await runAtomic(async (transaction) => {
        const slotWhere = startTime ? { date, startTime } : { date };
        const slots = await ShiftSlot.findAll({ where: slotWhere, transaction });
        const result = [];
        for (const slot of slots) {
            const active = await Reservation.findAll({ where: { shiftSlotId: slot.id, status: 'confirmed' }, transaction });
            if (active.length === 0) continue;
            await Reservation.update({ status: 'cancelled' }, { where: { id: active.map((r) => r.id) }, transaction });
            await slot.decrement('bookedCovers', { by: active.reduce((sum, r) => sum + r.guests, 0), transaction });
            active.forEach((r) => { r.setDataValue('slot', slot); result.push(r); });
        }
        return result;
    });

    notifyAvailabilityChanged(date);
    return { cancelled, message: cleanMessage };
}

module.exports = { listDay, setAttendance, setPhoneFlag, getPhoneFlag, bulkCancel };
