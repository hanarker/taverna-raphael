const { resetDb, futureDate, bookingInput, uniquePhone, models, sequelize } = require('./helpers/db');
const { createBooking, cancelBooking } = require('../src/services/booking.service');
const { romeInstant } = require('../src/utils/time');

beforeEach(resetDb);
afterAll(() => sequelize.close());

async function fillSlot(date, startTime, covers) {
    // Riempie il turno con prenotazioni da backoffice (max 8 per riga solo online: qui backoffice).
    let remaining = covers;
    let i = 0;
    while (remaining > 0) {
        const guests = Math.min(remaining, 10);
        await createBooking(bookingInput({ date, startTime, guests, phone: uniquePhone(900 + i) }), { source: 'backoffice' });
        remaining -= guests;
        i += 1;
    }
}

describe('concorrenza sull\'ultimo posto', () => {
    test('10 richieste parallele da 1 coperto con 1 solo posto libero: ne passa esattamente una', async () => {
        const date = futureDate(5);
        await fillSlot(date, '19:30', 39);

        const attempts = Array.from({ length: 10 }, (_, i) =>
            createBooking(bookingInput({ date, phone: uniquePhone(i), guests: 1 }), { source: 'online' })
                .then(() => 'ok', (err) => err.code));
        const results = await Promise.all(attempts);

        expect(results.filter((r) => r === 'ok')).toHaveLength(1);
        expect(results.filter((r) => r === 'INSUFFICIENT_SEATS')).toHaveLength(9);

        const slot = await models.ShiftSlot.findOne({ where: { date, startTime: '19:30' } });
        const sum = await models.Reservation.sum('guests', { where: { shiftSlotId: slot.id, status: 'confirmed' } });
        expect(slot.bookedCovers).toBe(40);
        expect(sum).toBe(40);
    });

    test('due richieste concorrenti sull\'ultimo posto: una sola riesce', async () => {
        const date = futureDate(6);
        await fillSlot(date, '19:30', 39);

        const results = await Promise.all([
            createBooking(bookingInput({ date, phone: uniquePhone(1), guests: 1 }), { source: 'online' }).then(() => 'ok', (e) => e.code),
            createBooking(bookingInput({ date, phone: uniquePhone(2), guests: 1 }), { source: 'online' }).then(() => 'ok', (e) => e.code),
        ]);

        expect(results.sort()).toEqual(['INSUFFICIENT_SEATS', 'ok']);
    });

    test('rifiuta una richiesta maggiore dei posti residui con il messaggio configurato', async () => {
        const date = futureDate(5);
        await fillSlot(date, '19:30', 37);

        await expect(createBooking(bookingInput({ date, guests: 4 }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'INSUFFICIENT_SEATS', status: 409, available: 3 });
    });
});

describe('doppia prenotazione stesso numero/stesso turno', () => {
    test('blocca lo stesso numero scritto in formati diversi', async () => {
        const date = futureDate(5);
        await createBooking(bookingInput({ date, phone: '+39 333 1234567' }), { source: 'online' });

        await expect(createBooking(bookingInput({ date, phone: '+39-333-1234567' }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'DUPLICATE_PHONE', status: 409 });
    });

    test('consente lo stesso numero in un altro turno', async () => {
        const date = futureDate(5);
        await createBooking(bookingInput({ date, startTime: '19:30' }), { source: 'online' });
        await expect(createBooking(bookingInput({ date, startTime: '21:00' }), { source: 'online' })).resolves.toBeDefined();
    });

    test('dopo la cancellazione lo stesso numero può prenotare di nuovo e i posti tornano liberi', async () => {
        const date = futureDate(5);
        const first = await createBooking(bookingInput({ date, guests: 4 }), { source: 'online' });
        await cancelBooking(first.id);

        const slot = await models.ShiftSlot.findOne({ where: { date, startTime: '19:30' } });
        expect(slot.bookedCovers).toBe(0);
        await expect(createBooking(bookingInput({ date }), { source: 'online' })).resolves.toBeDefined();
    });

    test('due richieste concorrenti dello stesso numero: ne passa una sola', async () => {
        const date = futureDate(5);
        const results = await Promise.all([
            createBooking(bookingInput({ date }), { source: 'online' }).then(() => 'ok', (e) => e.code),
            createBooking(bookingInput({ date }), { source: 'online' }).then(() => 'ok', (e) => e.code),
        ]);
        expect(results.sort()).toEqual(['DUPLICATE_PHONE', 'ok']);
    });
});

describe('regole di prenotabilità online', () => {
    test('rifiuta più di 8 coperti online ma li accetta da backoffice', async () => {
        const date = futureDate(5);
        await expect(createBooking(bookingInput({ date, guests: 9 }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'VALIDATION', status: 400 });
        await expect(createBooking(bookingInput({ date, guests: 12, phone: uniquePhone(5) }), { source: 'backoffice' }))
            .resolves.toBeDefined();
    });

    test('rifiuta date oltre i 30 giorni solo online', async () => {
        const date = futureDate(31);
        await expect(createBooking(bookingInput({ date }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'OUT_OF_WINDOW', status: 409 });
        await expect(createBooking(bookingInput({ date }), { source: 'backoffice' })).resolves.toBeDefined();
    });

    test('accetta il trentesimo giorno', async () => {
        await expect(createBooking(bookingInput({ date: futureDate(30) }), { source: 'online' })).resolves.toBeDefined();
    });

    test('rifiuta date passate', async () => {
        await expect(createBooking(bookingInput({ date: futureDate(-1) }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'OUT_OF_WINDOW' });
    });

    test('rifiuta un turno inesistente per la data', async () => {
        await expect(createBooking(bookingInput({ startTime: '17:00', date: futureDate(5) }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'SHIFT_NOT_FOUND', status: 404 });
    });

    test('rifiuta il turno oltre il cutoff (default 2 ore) e accetta subito prima', async () => {
        const date = futureDate(0);
        // Turno alle 19:30 Europe/Rome: 90 minuti prima → oltre il cutoff; 3 ore prima → ok.
        const tooLate = new Date(romeInstant(date, '19:30').getTime() - 90 * 60 * 1000);
        const early = new Date(romeInstant(date, '19:30').getTime() - 180 * 60 * 1000);

        await expect(createBooking(bookingInput({ date, startTime: '19:30' }), { source: 'online', now: tooLate }))
            .rejects.toMatchObject({ code: 'CUTOFF_PASSED', status: 409 });
        await expect(createBooking(bookingInput({ date, startTime: '19:30' }), { source: 'online', now: early }))
            .resolves.toBeDefined();
    });

    test('richiede il consenso esplicito e lo registra con timestamp', async () => {
        const date = futureDate(5);
        await expect(createBooking(bookingInput({ date, consent: false }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'VALIDATION' });

        const created = await createBooking(bookingInput({ date }), { source: 'online' });
        expect(created.consentAt).toBeInstanceOf(Date);
    });

    test('rifiuta telefono senza prefisso internazionale', async () => {
        await expect(createBooking(bookingInput({ phone: '333 1234567' }), { source: 'online' }))
            .rejects.toMatchObject({ code: 'VALIDATION' });
    });

    test('salva il telefono in E.164 e ripulisce i caratteri di controllo dal nome', async () => {
        const created = await createBooking(bookingInput({ firstName: '  Mario\u0000  ', phone: '+39 333 123 4567' }), { source: 'online' });
        expect(created.phone).toBe('+393331234567');
        expect(created.firstName).toBe('Mario');
    });
});

describe('robustezza (esito revisione)', () => {
    test('rifiuta date non di calendario come 31 settembre', async () => {
        await expect(createBooking(bookingInput({ date: '2026-09-31' }), { source: 'backoffice' }))
            .rejects.toMatchObject({ code: 'VALIDATION' });
    });

    test('lo spostamento di turno azzera i reminder già inviati', async () => {
        const { updateBooking } = require('../src/services/booking.service');
        const date = futureDate(5);
        const r = await createBooking(bookingInput({ date, startTime: '19:30' }), { source: 'online' });
        await r.update({ reminder24At: new Date(), reminderMorningAt: new Date() });

        await updateBooking(r.id, { startTime: '21:00' });
        await r.reload();
        expect(r.reminder24At).toBeNull();
        expect(r.reminderMorningAt).toBeNull();
    });
});
