const { Op } = require('sequelize');
const { runAtomic, isSqlite } = require('./atomic');
const ShiftSlot = require('../models/ShiftSlot');
const Reservation = require('../models/Reservation');
const { BookingError } = require('./booking.errors');
const { getSettings } = require('./settings.service');
const { resolveShiftsForDate } = require('./schedule.service');
const { notifyAvailabilityChanged } = require('./availability.events');
const { normalizePhone, hashPhone } = require('../utils/phone');
const { cleanText } = require('../utils/sanitize');
const { addDaysToISO, toISODate, romeInstant, isValidISODate, MS_PER_MINUTE } = require('../utils/time');
const { MAX_GUESTS_ONLINE, SHIFT_CAPACITY } = require('../utils/shifts');

const CONSENT_VERSION = '1';
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function validationError(message) {
    return new BookingError('VALIDATION', 400, message);
}

// Valida e normalizza l'input; ritorna un oggetto nuovo (nessuna mutazione dell'input).
function prepareInput(input, source) {
    const firstName = cleanText(input.firstName, 80);
    const lastName = cleanText(input.lastName, 80);
    const email = cleanText(input.email, 160);
    const notes = cleanText(input.notes, 1000) || null;
    const guests = Number(input.guests);
    const phone = normalizePhone(input.phone);

    if (!firstName) throw validationError('Il nome è obbligatorio.');
    if (!lastName) throw validationError('Il cognome è obbligatorio.');
    if (!EMAIL_PATTERN.test(email)) throw validationError('Inserisci un indirizzo email valido.');
    if (!phone) throw validationError('Inserisci un numero di telefono valido, con prefisso internazionale (es. +39).');
    if (!isValidISODate(String(input.date))) throw validationError('La data non è valida.');
    if (!/^\d{2}:\d{2}$/.test(String(input.startTime))) throw validationError('Seleziona un turno.');
    if (!Number.isInteger(guests) || guests < 1) throw validationError('Indica il numero di persone.');
    if (source === 'online' && guests > MAX_GUESTS_ONLINE) {
        throw validationError(`Massimo ${MAX_GUESTS_ONLINE} persone per prenotazione online: per gruppi più numerosi contattaci direttamente.`);
    }
    if (source === 'online' && input.consent !== true) {
        throw validationError('Il consenso al trattamento dei dati è obbligatorio per prenotare.');
    }

    return {
        firstName, lastName, email, notes, guests, phone,
        phoneHash: hashPhone(phone),
        date: String(input.date),
        startTime: String(input.startTime),
        consent: input.consent === true,
    };
}

// Restrizioni del solo form pubblico: finestra di 30 giorni e cutoff prima del turno.
// Ritorna null se prenotabile, altrimenti { code, message } (usato anche per la disponibilità).
function onlineRestriction({ date, startTime }, settings, now) {
    const today = toISODate(now);
    const lastDay = addDaysToISO(today, settings.bookingWindowDays);
    if (date < today || date > lastDay) {
        return { code: 'OUT_OF_WINDOW', message: `Puoi prenotare da oggi fino a ${settings.bookingWindowDays} giorni in avanti.` };
    }
    const shiftStart = romeInstant(date, startTime).getTime();
    if (shiftStart - settings.cutoffMinutes * MS_PER_MINUTE < now.getTime()) {
        return { code: 'CUTOFF_PASSED', message: 'Le prenotazioni online per questo turno sono chiuse: contattaci direttamente.' };
    }
    return null;
}

function assertBookableOnline(data, settings, now) {
    const restriction = onlineRestriction(data, settings, now);
    if (restriction) throw new BookingError(restriction.code, 409, restriction.message);
}

async function lockOrCreateSlot(data, shift, transaction) {
    const lockOption = isSqlite() ? {} : { lock: transaction.LOCK.UPDATE };
    const existing = await ShiftSlot.findOne({
        where: { date: data.date, startTime: data.startTime }, transaction, ...lockOption,
    });
    if (existing) return existing;
    return ShiftSlot.create({
        date: data.date, startTime: data.startTime, name: shift.name, capacity: SHIFT_CAPACITY, bookedCovers: 0,
    }, { transaction });
}

// source: 'online' applica finestra, cutoff, limite 8 e consenso; 'backoffice' no.
// La capienza (40) e il divieto di doppio numero valgono per entrambi (ASSUNZIONE 1 e 2 del piano).
async function createBooking(input, { source = 'online', now = new Date() } = {}) {
    const data = prepareInput(input, source);

    const reservation = await runAtomic(async (transaction) => {
        const settings = await getSettings({ transaction });
        if (source === 'online') assertBookableOnline(data, settings, now);

        const shifts = await resolveShiftsForDate(data.date, { transaction });
        const shift = shifts.find((s) => s.startTime === data.startTime);
        if (!shift) throw new BookingError('SHIFT_NOT_FOUND', 404, 'Il turno selezionato non è disponibile per questa data.');

        const slot = await lockOrCreateSlot(data, shift, transaction);

        const duplicate = await Reservation.findOne({
            where: { shiftSlotId: slot.id, phone: data.phone, status: 'confirmed' }, transaction,
        });
        if (duplicate) {
            throw new BookingError('DUPLICATE_PHONE', 409,
                'Esiste già una prenotazione con questo numero di telefono per il turno selezionato.');
        }

        const available = slot.capacity - slot.bookedCovers;
        if (data.guests > available) {
            throw new BookingError('INSUFFICIENT_SEATS', 409, settings.insufficientSeatsMessage, { available });
        }

        const created = await Reservation.create({
            shiftSlotId: slot.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            phoneHash: data.phoneHash,
            guests: data.guests,
            notes: data.notes,
            source,
            status: 'confirmed',
            consentAt: data.consent ? now : null,
            consentVersion: data.consent ? CONSENT_VERSION : null,
        }, { transaction });
        await slot.increment('bookedCovers', { by: data.guests, transaction });

        created.setDataValue('slot', slot);
        return created;
    });

    notifyAvailabilityChanged(data.date);
    return reservation;
}

// Annulla una prenotazione e libera subito i posti. La notifica al cliente è a carico del chiamante.
async function cancelBooking(reservationId) {
    const reservation = await runAtomic(async (transaction) => {
        const found = await Reservation.findByPk(reservationId, { transaction, include: [{ model: ShiftSlot, as: 'slot' }] });
        if (!found) throw new BookingError('NOT_FOUND', 404, 'Prenotazione non trovata.');
        if (found.status === 'cancelled') {
            found.setDataValue('alreadyCancelled', true);
            return found;
        }

        await found.update({ status: 'cancelled' }, { transaction });
        await found.slot.decrement('bookedCovers', { by: found.guests, transaction });
        return found;
    });

    notifyAvailabilityChanged(reservation.slot.date);
    return reservation;
}

// Modifica dati/turno/coperti di una prenotazione (solo backoffice). Ricalcola i contatori dei turni
// coinvolti nella stessa transazione, con gli stessi controlli di capienza e doppio numero della creazione.
async function updateBooking(reservationId, patch) {
    const result = await runAtomic(async (transaction) => {
        const reservation = await Reservation.findByPk(reservationId, { transaction, include: [{ model: ShiftSlot, as: 'slot' }] });
        if (!reservation) throw new BookingError('NOT_FOUND', 404, 'Prenotazione non trovata.');
        if (reservation.status === 'cancelled') {
            throw new BookingError('ALREADY_CANCELLED', 409, 'La prenotazione è annullata e non può essere modificata.');
        }

        const oldSlot = reservation.slot;
        const data = prepareInput({
            firstName: reservation.firstName, lastName: reservation.lastName, email: reservation.email,
            phone: reservation.phone, guests: reservation.guests, notes: reservation.notes,
            date: oldSlot.date, startTime: oldSlot.startTime, ...patch,
        }, 'backoffice');

        const isMoving = data.date !== oldSlot.date || data.startTime !== oldSlot.startTime;
        let targetSlot = oldSlot;
        if (isMoving) {
            const shifts = await resolveShiftsForDate(data.date, { transaction });
            const shift = shifts.find((s) => s.startTime === data.startTime);
            if (!shift) throw new BookingError('SHIFT_NOT_FOUND', 404, 'Il turno selezionato non è disponibile per questa data.');
            targetSlot = await lockOrCreateSlot(data, shift, transaction);
        }

        const duplicate = await Reservation.findOne({
            where: { shiftSlotId: targetSlot.id, phone: data.phone, status: 'confirmed', id: { [Op.ne]: reservation.id } }, transaction,
        });
        if (duplicate) {
            throw new BookingError('DUPLICATE_PHONE', 409, 'Esiste già una prenotazione con questo numero di telefono per il turno selezionato.');
        }

        const freeSeats = targetSlot.capacity - targetSlot.bookedCovers;
        const extraSeatsNeeded = isMoving ? data.guests : data.guests - reservation.guests;
        if (extraSeatsNeeded > freeSeats) {
            throw new BookingError('INSUFFICIENT_SEATS', 409, 'Posti insufficienti per questa modifica.', { available: freeSeats });
        }

        if (isMoving) {
            await oldSlot.decrement('bookedCovers', { by: reservation.guests, transaction });
            await targetSlot.increment('bookedCovers', { by: data.guests, transaction });
        } else if (extraSeatsNeeded !== 0) {
            await targetSlot.increment('bookedCovers', { by: extraSeatsNeeded, transaction });
        }

        await reservation.update({
            shiftSlotId: targetSlot.id, firstName: data.firstName, lastName: data.lastName, email: data.email,
            phone: data.phone, phoneHash: data.phoneHash, guests: data.guests, notes: data.notes,
            // Se cambia turno, i reminder già inviati non valgono più per il nuovo orario.
            ...(isMoving ? { reminder24At: null, reminderMorningAt: null } : {}),
        }, { transaction });
        return { reservation, oldDate: oldSlot.date, newDate: targetSlot.date };
    });

    notifyAvailabilityChanged(result.oldDate);
    if (result.newDate !== result.oldDate) notifyAvailabilityChanged(result.newDate);
    return result.reservation;
}

module.exports = {
    createBooking, cancelBooking, updateBooking, onlineRestriction, CONSENT_VERSION,
};
