// Costanti di dominio delle prenotazioni. I turni veri sono configurati da backoffice
// (ShiftTemplate / ShiftOverride): qui restano solo i valori fissi richiesti dal cliente.

const SHIFT_DURATION_MINUTES = 90;
const SHIFT_CAPACITY = 40;

// Massimo ospiti per singola prenotazione online; i gruppi più numerosi li inserisce il titolare.
const MAX_GUESTS_ONLINE = 8;

const TIMEZONE = 'Europe/Rome';

// Valori di default dei parametri configurabili da backoffice (modello Setting).
// ASSUNZIONE: cutoff di 2 ore in attesa di conferma dal cliente.
const DEFAULT_SETTINGS = Object.freeze({
    cutoffMinutes: 120,
    bookingWindowDays: 30,
    insufficientSeatsMessage: 'Posti insufficienti per questo turno, prova un altro orario o riduci il numero di persone.',
    cancellationContactText: '',
    ownerWhatsapp: '',
    restaurantPhone: '+39 366 357 5967',
    incomingReplyText: 'Per modifiche o annullamenti chiama il +39 366 357 5967',
    whatsappTemplates: {},
});

module.exports = {
    SHIFT_DURATION_MINUTES,
    SHIFT_CAPACITY,
    MAX_GUESTS_ONLINE,
    TIMEZONE,
    DEFAULT_SETTINGS,
};
