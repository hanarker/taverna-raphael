// Errore di dominio: il controller lo traduce in risposta HTTP (status + code stabile per il frontend).
class BookingError extends Error {
    constructor(code, status, message, extra = {}) {
        super(message);
        this.name = 'BookingError';
        this.code = code;
        this.status = status;
        Object.assign(this, extra);
    }
}

module.exports = { BookingError };
