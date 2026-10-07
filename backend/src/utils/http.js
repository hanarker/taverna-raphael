const { BookingError } = require('../services/booking.errors');

// Traduce gli errori di dominio in risposte HTTP; per quelli imprevisti logga il dettaglio
// lato server e risponde con un messaggio generico (nessuna fuga di informazioni).
function sendError(res, error) {
    if (error instanceof BookingError) {
        const body = { code: error.code, error: error.message };
        if (error.available !== undefined) body.available = error.available;
        return res.status(error.status).json(body);
    }
    console.error('[errore imprevisto]', error);
    return res.status(500).json({ code: 'INTERNAL', error: 'Si è verificato un errore. Riprova tra qualche minuto.' });
}

const { isValidISODate } = require('./time');

// Id numerico positivo da un parametro di route (NaN/negativi → null, il chiamante risponde 400).
function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { sendError, isISODate: isValidISODate, parseId };
