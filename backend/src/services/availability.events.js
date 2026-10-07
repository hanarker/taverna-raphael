const { EventEmitter } = require('events');

// Bus in-process: ogni variazione di capienza emette la data interessata,
// così lo stream SSE aggiorna subito i form pubblici aperti.
const emitter = new EventEmitter();
emitter.setMaxListeners(0);

const AVAILABILITY_CHANGED = 'availability-changed';

function notifyAvailabilityChanged(date) {
    emitter.emit(AVAILABILITY_CHANGED, { date });
}

function onAvailabilityChanged(listener) {
    emitter.on(AVAILABILITY_CHANGED, listener);
    return () => emitter.off(AVAILABILITY_CHANGED, listener);
}

module.exports = { notifyAvailabilityChanged, onAvailabilityChanged };
