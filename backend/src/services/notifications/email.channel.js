// TODO(fallback email): il provider email non è ancora stato scelto (decisione rinviata dal cliente).
// Finché non viene implementato, il fallback registra solo che avrebbe dovuto scattare.
// Quando si implementa: inviare a reservation.email lo stesso contenuto dell'evento, in italiano.
const EMAIL_SKIPPED_STATUS = 'skipped_email_todo';

async function sendEmail(event, reservation) {
    console.warn(`[email fallback NON IMPLEMENTATO] evento=${event} prenotazione=${reservation.id}`);
    return { status: EMAIL_SKIPPED_STATUS };
}

module.exports = { sendEmail, EMAIL_SKIPPED_STATUS };
