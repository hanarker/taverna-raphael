const ShiftSlot = require('../models/ShiftSlot');
const { getSettings } = require('./settings.service');
const { resolveShiftsForDate } = require('./schedule.service');
const { onlineRestriction } = require('./booking.service');
const { SHIFT_CAPACITY, MAX_GUESTS_ONLINE } = require('../utils/shifts');

// Stato pubblico di una data: turni, posti liberi e se sono prenotabili online (finestra + cutoff).
async function getAvailability(date, now = new Date()) {
    const settings = await getSettings();
    const shifts = await resolveShiftsForDate(date);
    const slots = await ShiftSlot.findAll({ where: { date } });
    const bookedByStart = new Map(slots.map((s) => [s.startTime, s]));

    return {
        date,
        maxGuestsOnline: MAX_GUESTS_ONLINE,
        bookingWindowDays: settings.bookingWindowDays,
        insufficientSeatsMessage: settings.insufficientSeatsMessage,
        restaurantPhone: settings.restaurantPhone,
        shifts: shifts.map((shift) => {
            const slot = bookedByStart.get(shift.startTime);
            const capacity = slot ? slot.capacity : SHIFT_CAPACITY;
            const available = capacity - (slot ? slot.bookedCovers : 0);
            const restriction = onlineRestriction({ date, startTime: shift.startTime }, settings, now);
            return {
                name: shift.name,
                startTime: shift.startTime,
                capacity,
                available,
                bookable: restriction === null && available > 0,
                reason: restriction ? restriction.code : (available > 0 ? null : 'FULL'),
            };
        }),
    };
}

module.exports = { getAvailability };
