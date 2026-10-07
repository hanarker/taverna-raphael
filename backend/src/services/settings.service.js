const Setting = require('../models/Setting');
const { DEFAULT_SETTINGS } = require('../utils/shifts');
const { BookingError } = require('./booking.errors');
const { cleanText } = require('../utils/sanitize');
const { normalizePhone } = require('../utils/phone');

// Impostazioni = default + eventuali override salvati da backoffice.
async function getSettings(options = {}) {
    const rows = await Setting.findAll({ transaction: options.transaction });
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return { ...DEFAULT_SETTINGS, ...stored };
}

const EDITABLE_KEYS = ['cutoffMinutes', 'insufficientSeatsMessage', 'cancellationContactText', 'ownerWhatsapp', 'restaurantPhone', 'incomingReplyText', 'whatsappTemplates'];
const MAX_CUTOFF_MINUTES = 7 * 24 * 60;
const MAX_TEXT_LENGTH = 500;
const PHONE_DISPLAY_PATTERN = /^\+?[0-9][0-9 ]{5,24}$/;
const TEMPLATE_VARIABLES = ['name', 'date', 'time', 'guests', 'shiftName', 'contact', 'message', 'waLink'];

function invalid(message) {
    return new BookingError('VALIDATION', 400, message);
}

// Valida e normalizza il patch. bookingWindowDays NON è modificabile: la finestra è fissata a 30 giorni dal cliente.
function parsePatch(patch) {
    const clean = {};
    if ('cutoffMinutes' in patch) {
        const value = Number(patch.cutoffMinutes);
        if (!Number.isInteger(value) || value < 0 || value > MAX_CUTOFF_MINUTES) throw invalid('Il cutoff deve essere un numero di minuti tra 0 e 10080.');
        clean.cutoffMinutes = value;
    }
    for (const key of ['insufficientSeatsMessage', 'cancellationContactText']) {
        if (key in patch) clean[key] = cleanText(patch[key], MAX_TEXT_LENGTH);
    }
    if ('ownerWhatsapp' in patch) {
        const raw = String(patch.ownerWhatsapp ?? '').trim();
        const normalized = raw === '' ? '' : normalizePhone(raw);
        if (normalized === null) throw invalid('Numero WhatsApp del titolare non valido (serve il prefisso internazionale).');
        clean.ownerWhatsapp = normalized;
    }
    if ('restaurantPhone' in patch) {
        const phone = cleanText(patch.restaurantPhone, MAX_TEXT_LENGTH);
        if (!PHONE_DISPLAY_PATTERN.test(phone)) throw invalid('Inserisci un telefono del ristorante valido (es. +39 366 357 5967).');
        clean.restaurantPhone = phone;
    }
    if ('incomingReplyText' in patch) {
        const text = cleanText(patch.incomingReplyText, MAX_TEXT_LENGTH);
        if (!text) throw invalid('Il testo della risposta automatica non può essere vuoto.');
        clean.incomingReplyText = text;
    }
    if ('whatsappTemplates' in patch) clean.whatsappTemplates = parseTemplates(patch.whatsappTemplates);
    return clean;
}

function parseTemplates(raw) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw invalid('Configurazione template non valida.');
    return Object.fromEntries(Object.entries(raw).map(([event, template]) => {
        const variables = Array.isArray(template?.variables) ? template.variables : [];
        if (variables.some((v) => !TEMPLATE_VARIABLES.includes(v))) {
            throw invalid(`Variabili ammesse per i template: ${TEMPLATE_VARIABLES.join(', ')}.`);
        }
        return [event, { contentSid: cleanText(template?.contentSid, 64), variables }];
    }));
}

async function updateSettings(patch) {
    const clean = parsePatch(Object.fromEntries(Object.entries(patch).filter(([key]) => EDITABLE_KEYS.includes(key))));
    for (const [key, value] of Object.entries(clean)) {
        await Setting.upsert({ key, value });
    }
    return getSettings();
}

module.exports = { getSettings, updateSettings };
