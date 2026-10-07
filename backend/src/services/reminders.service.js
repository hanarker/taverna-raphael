const { Op } = require('sequelize');
const Reservation = require('../models/Reservation');
const ShiftSlot = require('../models/ShiftSlot');
const { notifyCustomer } = require('./notifications/notifier');
const { romeInstant, toISODate, MS_PER_MINUTE } = require('../utils/time');

const HOURS_24 = 24 * 60 * MS_PER_MINUTE;
const MORNING_REMINDER_TIME = '09:00';

// Prenota atomicamente l'invio (idempotenza): solo chi riesce a impostare il campo da NULL lo invia.
async function claim(reservation, field, now) {
    const [updated] = await Reservation.update({ [field]: now }, { where: { id: reservation.id, [field]: null } });
    return updated === 1;
}

// Errore tecnico nell'invio (non "WhatsApp rifiutato", che ha già il fallback): rilascia il claim
// così il job successivo riprova invece di perdere il reminder.
async function sendOrRelease(event, reservation, field) {
    const result = await notifyCustomer(event, reservation);
    if (result.status !== 'error') return true;
    await Reservation.update({ [field]: null }, { where: { id: reservation.id } });
    return false;
}

// Reminder a 24 ore dal turno. ASSUNZIONE 3: se la prenotazione è stata fatta a meno di 24 ore dal turno
// il reminder non ha senso (il cliente ha appena ricevuto la conferma) e viene saltato.
async function sendDueReminders24h(now = new Date()) {
    const upcoming = await Reservation.findAll({
        where: { status: 'confirmed', reminder24At: null },
        include: [{ model: ShiftSlot, as: 'slot', where: { date: { [Op.between]: [toISODate(now), toISODate(new Date(now.getTime() + 2 * HOURS_24))] } } }],
    });

    let sent = 0;
    for (const reservation of upcoming) {
        const start = romeInstant(reservation.slot.date, reservation.slot.startTime).getTime();
        const isInWindow = start > now.getTime() && start - now.getTime() <= HOURS_24;
        if (!isInWindow || !(await claim(reservation, 'reminder24At', now))) continue;

        const bookedTooLate = reservation.createdAt.getTime() > start - HOURS_24;
        if (bookedTooLate) continue;
        if (await sendOrRelease('reminder_24h', reservation, 'reminder24At')) sent += 1;
    }
    return sent;
}

// Reminder delle 09:00 del giorno del turno. Salta chi ha prenotato dopo le 09:00 dello stesso giorno.
async function sendMorningReminders(now = new Date()) {
    const today = toISODate(now);
    const nineAm = romeInstant(today, MORNING_REMINDER_TIME).getTime();
    const todays = await Reservation.findAll({
        where: { status: 'confirmed', reminderMorningAt: null },
        include: [{ model: ShiftSlot, as: 'slot', where: { date: today } }],
    });

    let sent = 0;
    for (const reservation of todays) {
        if (!(await claim(reservation, 'reminderMorningAt', now))) continue;
        if (reservation.createdAt.getTime() > nineAm) continue;
        if (await sendOrRelease('reminder_morning', reservation, 'reminderMorningAt')) sent += 1;
    }
    return sent;
}

module.exports = { sendDueReminders24h, sendMorningReminders, MORNING_REMINDER_TIME };
