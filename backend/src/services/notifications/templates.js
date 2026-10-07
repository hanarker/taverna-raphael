const dateFormatter = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
});

const MAX_VARIABLE_LENGTH = 500;

// Le variabili dei template WhatsApp non ammettono newline/tab né spazi ripetuti (regole Meta).
function toSingleLine(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_VARIABLE_LENGTH);
}

// Valori disponibili ai template. Quali usare, e in che ordine, lo decide la configurazione
// (Setting.whatsappTemplates[evento].variables): i testi si aggiornano senza toccare il codice.
function buildVariables(reservation, slot, settings, extra = {}) {
    return {
        name: reservation.firstName,
        date: dateFormatter.format(new Date(`${slot.date}T12:00:00Z`)),
        time: slot.startTime,
        guests: String(reservation.guests),
        shiftName: slot.name,
        contact: settings.cancellationContactText || '',
        message: extra.message || '',
        waLink: `https://wa.me/${String(reservation.phone).replace(/^\+/, '')}`,
    };
}

// Converte la lista ordinata di variabili nel formato Twilio Content API: {"1": "...", "2": "..."}.
function toContentVariables(variableNames, values) {
    return Object.fromEntries(variableNames.map((name, index) => [String(index + 1), toSingleLine(values[name])]));
}

module.exports = { buildVariables, toContentVariables, toSingleLine };
