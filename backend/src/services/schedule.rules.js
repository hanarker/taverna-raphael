const { SHIFT_DURATION_MINUTES } = require('../utils/shifts');

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(time) {
    const match = TIME_PATTERN.exec(time);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
}

// Funzione pura: verifica che nessun turno (durata fissa 1h30) si sovrapponga a un altro.
// Ritorna { valid, message } — il chiamante deve rifiutare il salvataggio, mai correggere in silenzio.
function validateNoOverlap(shifts) {
    const parsed = [];
    for (const shift of shifts) {
        const start = toMinutes(shift.startTime);
        if (start === null) {
            return { valid: false, message: `Orario non valido per il turno "${shift.name}": ${shift.startTime} (formato HH:MM)` };
        }
        parsed.push({ ...shift, start, end: start + SHIFT_DURATION_MINUTES });
    }

    const sorted = [...parsed].sort((a, b) => a.start - b.start);
    for (let i = 1; i < sorted.length; i += 1) {
        const previous = sorted[i - 1];
        const current = sorted[i];
        if (current.start < previous.end) {
            return {
                valid: false,
                message: `I turni "${previous.name}" (${previous.startTime}) e "${current.name}" (${current.startTime}) si sovrappongono: ogni turno dura ${SHIFT_DURATION_MINUTES} minuti.`,
            };
        }
    }
    return { valid: true, message: null };
}

module.exports = { validateNoOverlap, toMinutes, TIME_PATTERN };
