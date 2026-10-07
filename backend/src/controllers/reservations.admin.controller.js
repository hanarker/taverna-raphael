const { createBooking, cancelBooking, updateBooking } = require('../services/booking.service');
const admin = require('../services/reservations.admin.service');
const { notifyCustomer } = require('../services/notifications/notifier');
const { dispatch } = require('../services/notifications/dispatch');
const { getSettings, updateSettings } = require('../services/settings.service');
const { getStats } = require('../services/stats.service');
const { sendError, isISODate, parseId } = require('../utils/http');
const { toISODate } = require('../utils/time');
const { BookingError } = require('../services/booking.errors');

const badRequest = (res, error) => res.status(400).json({ code: 'VALIDATION', error });
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_STATS_DAYS = 28;

function serialize(reservation) {
    const slot = reservation.getDataValue('slot');
    return {
        id: reservation.id, firstName: reservation.firstName, lastName: reservation.lastName, email: reservation.email,
        phone: reservation.phone, guests: reservation.guests, notes: reservation.notes, source: reservation.source,
        status: reservation.status, attendance: reservation.attendance,
        date: slot?.date, startTime: slot?.startTime, shiftName: slot?.name,
    };
}

function requireId(req) {
    const id = parseId(req.params.id);
    if (id === null) throw new BookingError('VALIDATION', 400, 'Identificativo non valido.');
    return id;
}

const handler = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (error) {
        sendError(res, error);
    }
};

exports.list = handler(async (req, res) => {
    const date = req.query.date ?? toISODate(new Date());
    if (!isISODate(date)) return badRequest(res, 'Data non valida (YYYY-MM-DD).');
    res.set('Cache-Control', 'no-store');
    res.json(await admin.listDay(date));
});

// ASSUNZIONE: le prenotazioni inserite dal titolare non inviano la conferma automatica
// (il requisito la prevede solo per quelle online); l'annullamento invece notifica sempre.
exports.create = handler(async (req, res) => {
    const reservation = await createBooking(req.body ?? {}, { source: 'backoffice' });
    res.status(201).json(serialize(reservation));
});

exports.update = handler(async (req, res) => {
    const reservation = await updateBooking(requireId(req), req.body ?? {});
    res.json(serialize(await reservation.reload({ include: ['slot'] })));
});

exports.cancel = handler(async (req, res) => {
    const reservation = await cancelBooking(requireId(req));
    if (!reservation.getDataValue('alreadyCancelled')) dispatch(() => notifyCustomer('cancellation', reservation));
    res.json(serialize(reservation));
});

exports.setAttendance = handler(async (req, res) => {
    const reservation = await admin.setAttendance(requireId(req), req.body?.attendance ?? null);
    res.json(serialize(reservation));
});

exports.bulkCancel = handler(async (req, res) => {
    const { date, startTime, message } = req.body ?? {};
    if (!isISODate(date)) return badRequest(res, 'Data non valida (YYYY-MM-DD).');
    const { cancelled, message: cleanMessage } = await admin.bulkCancel({ date, startTime, message });
    cancelled.forEach((reservation) => dispatch(() => notifyCustomer('bulk_cancellation', reservation, { message: cleanMessage })));
    res.json({ cancelled: cancelled.length, notified: cancelled.length });
});

exports.getFlag = handler(async (req, res) => {
    res.json(await admin.getPhoneFlag(req.query.phone));
});

exports.putFlag = handler(async (req, res) => {
    const { phone, reservationId, flagged } = req.body ?? {};
    if (typeof flagged !== 'boolean') return badRequest(res, 'Indica flagged true/false.');
    res.json(await admin.setPhoneFlag({ phone, reservationId, flagged }));
});

exports.getSettings = handler(async (req, res) => res.json(await getSettings()));

exports.putSettings = handler(async (req, res) => res.json(await updateSettings(req.body ?? {})));

exports.stats = handler(async (req, res) => {
    const to = req.query.to ?? toISODate(new Date());
    const from = req.query.from ?? toISODate(new Date(Date.now() - DEFAULT_STATS_DAYS * MS_PER_DAY));
    if (!isISODate(from) || !isISODate(to) || from > to) throw new BookingError('VALIDATION', 400, 'Intervallo di date non valido.');
    res.json(await getStats(from, to));
});
