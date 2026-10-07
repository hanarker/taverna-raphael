const { createBooking } = require('../services/booking.service');
const { sendError } = require('../utils/http');
const { notifyCustomer, notifyOwner } = require('../services/notifications/notifier');
const { dispatch } = require('../services/notifications/dispatch');

// Dati minimi restituiti al cliente per il ticket di conferma.
function toPublicReservation(reservation) {
    const slot = reservation.getDataValue('slot');
    return {
        id: reservation.id,
        firstName: reservation.firstName,
        lastName: reservation.lastName,
        date: slot.date,
        startTime: slot.startTime,
        shiftName: slot.name,
        guests: reservation.guests,
    };
}

exports.createReservation = async (req, res) => {
    try {
        const reservation = await createBooking(req.body ?? {}, { source: 'online' });
        // Conferma al cliente (WhatsApp + fallback email) e avviso al titolare, senza bloccare la risposta.
        dispatch(async () => {
            await notifyCustomer('confirmation', reservation);
            await notifyOwner(reservation);
        });
        res.status(201).json(toPublicReservation(reservation));
    } catch (error) {
        sendError(res, error);
    }
};

exports.toPublicReservation = toPublicReservation;
