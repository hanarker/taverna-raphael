const crypto = require('crypto');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

// Il prefisso internazionale è obbligatorio: senza "+" (o "00") il numero è rifiutato.
function normalizePhone(raw) {
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const withPlus = trimmed.startsWith('00') ? `+${trimmed.slice(2)}` : trimmed;
    if (!withPlus.startsWith('+')) return null;

    const parsed = parsePhoneNumberFromString(withPlus);
    return parsed && parsed.isValid() ? parsed.number : null;
}

// HMAC del numero E.164: permette di riconoscere un numero già segnalato senza conservarlo in chiaro.
function hashPhone(e164) {
    const secret = process.env.PHONE_HASH_SECRET;
    if (!secret) throw new Error('PHONE_HASH_SECRET non configurato');
    return crypto.createHmac('sha256', secret).update(e164).digest('hex');
}

module.exports = { normalizePhone, hashPhone };
