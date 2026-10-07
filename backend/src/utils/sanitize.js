// Sanitizzazione standard dei campi di testo libero: niente caratteri di controllo,
// spazi ripuliti, lunghezza limitata. L'escaping HTML resta a carico del rendering (React).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function cleanText(value, maxLength) {
    if (typeof value !== 'string') return '';
    return value.replace(CONTROL_CHARS, '').trim().slice(0, maxLength);
}

module.exports = { cleanText };
