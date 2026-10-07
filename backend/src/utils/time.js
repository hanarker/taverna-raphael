const { TIMEZONE } = require('./shifts');

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});
const partsFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

// Data "YYYY-MM-DD" di un istante nel fuso del ristorante (non UTC).
function toISODate(instant) {
    return dateFormatter.format(instant);
}

function addDays(instant, days) {
    return new Date(instant.getTime() + days * MS_PER_DAY);
}

// Sposta una data ISO di N giorni (aritmetica di calendario, senza problemi di DST).
function addDaysToISO(isoDate, days) {
    const base = new Date(`${isoDate}T12:00:00Z`);
    return new Date(base.getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

// Giorno della settimana (0 = domenica) di una data ISO.
function weekdayOf(isoDate) {
    return new Date(`${isoDate}T12:00:00Z`).getUTCDay();
}

// Scarto (ms) tra fuso del ristorante e UTC in un dato istante.
function zoneOffsetMs(instant) {
    const parts = Object.fromEntries(partsFormatter.formatToParts(instant).map((p) => [p.type, p.value]));
    const asUtc = Date.UTC(parts.year, Number(parts.month) - 1, parts.day, parts.hour, parts.minute, parts.second);
    return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

// Istante UTC corrispondente a "date HH:MM" nel fuso Europe/Rome.
function romeInstant(isoDate, time) {
    const [hour, minute] = time.split(':').map(Number);
    const [year, month, day] = isoDate.split('-').map(Number);
    const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);
    const firstGuess = naiveUtc - zoneOffsetMs(new Date(naiveUtc));
    return new Date(naiveUtc - zoneOffsetMs(new Date(firstGuess)));
}

// True solo per date di calendario reali (rifiuta 2026-09-31, che Date.parse farebbe slittare al 1 ottobre).
function isValidISODate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

module.exports = {
    isValidISODate, MS_PER_MINUTE, MS_PER_DAY, toISODate, addDays, addDaysToISO, weekdayOf, romeInstant,
};
