const mockCreate = jest.fn().mockResolvedValue({ sid: 'SMx' });
const mockValidate = jest.fn();
jest.mock('twilio', () => {
    const factory = jest.fn(() => ({ messages: { create: mockCreate } }));
    factory.validateRequest = mockValidate;
    return factory;
});

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { resetDb, futureDate, bookingInput, uniquePhone, models, sequelize } = require('./helpers/db');
const app = require('../src/app');
const { createBooking } = require('../src/services/booking.service');
const { updateSettings } = require('../src/services/settings.service');
const { flushNotifications } = require('../src/services/notifications/dispatch');
const { romeInstant, toISODate, addDays } = require('../src/utils/time');

const auth = () => ({ Authorization: `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET)}` });

beforeEach(async () => {
    await resetDb();
    mockCreate.mockClear();
    delete process.env.TWILIO_ACCOUNT_SID;
});
afterEach(flushNotifications);
afterAll(() => sequelize.close());

const manual = (over = {}) => ({
    firstName: 'Gruppo', lastName: 'Grande', email: 'g@example.com', phone: '+39 347 5556677',
    date: futureDate(6), startTime: '19:30', guests: 12, ...over,
});

describe('inserimento manuale e capienza', () => {
    test('il titolare inserisce un gruppo > 8 e la disponibilità pubblica si aggiorna subito', async () => {
        const date = futureDate(6);
        const res = await request(app).post('/api/admin/reservations').set(auth()).send(manual({ date }));
        expect(res.status).toBe(201);

        const avail = await request(app).get(`/api/availability?date=${date}`);
        expect(avail.body.shifts.find((s) => s.startTime === '19:30').available).toBe(28);
    });

    test('non permette di superare i 40 coperti nemmeno da backoffice', async () => {
        const res = await request(app).post('/api/admin/reservations').set(auth()).send(manual({ guests: 41 }));
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('INSUFFICIENT_SEATS');
    });
});

describe('lista giornaliera', () => {
    test('raggruppa per turno e segnala i numeri con flag no-show', async () => {
        const date = futureDate(3);
        const r = await createBooking(bookingInput({ date }), { source: 'online' });
        await models.NoShowFlag.create({ phoneHash: r.phoneHash });

        const res = await request(app).get(`/api/admin/reservations?date=${date}`).set(auth());
        expect(res.status).toBe(200);
        const cena = res.body.shifts.find((s) => s.startTime === '19:30');
        expect(cena.reservations).toHaveLength(1);
        expect(cena.reservations[0].hasNoShowFlag).toBe(true);
        expect(cena.bookedCovers).toBe(2);
        expect(res.body.shifts.find((s) => s.startTime === '13:00').reservations).toEqual([]);
    });
});

describe('annullamento singolo', () => {
    test('libera subito i posti e notifica il cliente', async () => {
        const date = futureDate(4);
        const r = await createBooking(bookingInput({ date, guests: 6 }), { source: 'online' });
        await updateSettings({ whatsappTemplates: { cancellation: { contentSid: 'HXc', variables: ['name'] } } });
        process.env.TWILIO_ACCOUNT_SID = 'AC1'; process.env.TWILIO_AUTH_TOKEN = 't'; process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1';

        const res = await request(app).post(`/api/admin/reservations/${r.id}/cancel`).set(auth());
        await flushNotifications();

        expect(res.status).toBe(200);
        const avail = await request(app).get(`/api/availability?date=${date}`);
        expect(avail.body.shifts.find((s) => s.startTime === '19:30').available).toBe(40);
        expect(mockCreate).toHaveBeenCalledTimes(1);
    });
});

describe('modifica prenotazione', () => {
    test('sposta la prenotazione su un altro turno aggiornando i due contatori', async () => {
        const date = futureDate(4);
        const r = await createBooking(bookingInput({ date, startTime: '19:30', guests: 4 }), { source: 'online' });

        const res = await request(app).put(`/api/admin/reservations/${r.id}`).set(auth()).send({ startTime: '21:00', guests: 5 });
        expect(res.status).toBe(200);

        const slots = await models.ShiftSlot.findAll({ where: { date }, order: [['startTime', 'ASC']] });
        expect(slots.map((s) => [s.startTime, s.bookedCovers])).toEqual([['19:30', 0], ['21:00', 5]]);
    });

    test('rifiuta un aumento di coperti oltre la capienza', async () => {
        const date = futureDate(4);
        await createBooking(bookingInput({ date, guests: 38, phone: uniquePhone(1) }), { source: 'backoffice' });
        const r = await createBooking(bookingInput({ date, guests: 2, phone: uniquePhone(2) }), { source: 'online' });
        const res = await request(app).put(`/api/admin/reservations/${r.id}`).set(auth()).send({ guests: 3 });
        expect(res.status).toBe(409);
    });
});

describe('presenza e flag no-show', () => {
    async function pastReservation() {
        const date = toISODate(addDays(new Date(), -2));
        return createBooking(bookingInput({ date }), { source: 'backoffice' });
    }

    test('marcare no-show crea il flag persistente e le prenotazioni future con quel numero risultano segnalate', async () => {
        const past = await pastReservation();
        const res = await request(app).patch(`/api/admin/reservations/${past.id}/attendance`).set(auth()).send({ attendance: 'no_show' });
        expect(res.status).toBe(200);

        const futureDay = futureDate(5);
        await createBooking(bookingInput({ date: futureDay }), { source: 'online' });
        const list = await request(app).get(`/api/admin/reservations?date=${futureDay}`).set(auth());
        const row = list.body.shifts.find((s) => s.startTime === '19:30').reservations[0];
        expect(row.hasNoShowFlag).toBe(true);
        // la prenotazione non viene bloccata
        expect(row.status).toBe('confirmed');
    });

    test('il flag si rimuove a mano', async () => {
        const past = await pastReservation();
        await request(app).patch(`/api/admin/reservations/${past.id}/attendance`).set(auth()).send({ attendance: 'no_show' });

        const res = await request(app).put('/api/admin/noshow-flags').set(auth()).send({ phone: '+39 333 1234567', flagged: false });
        expect(res.status).toBe(200);
        expect(await models.NoShowFlag.count()).toBe(0);

        const check = await request(app).get('/api/admin/noshow-flags?phone=%2B393331234567').set(auth());
        expect(check.body.flagged).toBe(false);
    });

    test('non si può marcare no-show un turno non ancora iniziato', async () => {
        const r = await createBooking(bookingInput({ date: futureDate(5) }), { source: 'online' });
        const res = await request(app).patch(`/api/admin/reservations/${r.id}/attendance`).set(auth()).send({ attendance: 'no_show' });
        expect(res.status).toBe(409);
        expect(await models.NoShowFlag.count()).toBe(0);
    });

    test('arrivato e in ritardo sono sempre marcabili; valori sconosciuti rifiutati', async () => {
        const r = await createBooking(bookingInput({ date: futureDate(5) }), { source: 'online' });
        const ok = await request(app).patch(`/api/admin/reservations/${r.id}/attendance`).set(auth()).send({ attendance: 'late' });
        expect(ok.status).toBe(200);
        const bad = await request(app).patch(`/api/admin/reservations/${r.id}/attendance`).set(auth()).send({ attendance: 'boh' });
        expect(bad.status).toBe(400);
    });
});

describe('annullamento in blocco', () => {
    test('annulla tutte le prenotazioni del turno, azzera i posti e invia il messaggio personalizzato a tutti', async () => {
        const date = futureDate(5);
        await createBooking(bookingInput({ date, phone: uniquePhone(1), guests: 3 }), { source: 'online' });
        await createBooking(bookingInput({ date, phone: uniquePhone(2), guests: 4 }), { source: 'online' });
        await createBooking(bookingInput({ date, startTime: '21:00', phone: uniquePhone(3) }), { source: 'online' });
        await updateSettings({ whatsappTemplates: { bulk_cancellation: { contentSid: 'HXb', variables: ['name', 'message'] } } });
        process.env.TWILIO_ACCOUNT_SID = 'AC1'; process.env.TWILIO_AUTH_TOKEN = 't'; process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1';

        const res = await request(app).post('/api/admin/reservations/bulk-cancel').set(auth())
            .send({ date, startTime: '19:30', message: 'Guasto\nalla cucina' });
        await flushNotifications();

        expect(res.status).toBe(200);
        expect(res.body.cancelled).toBe(2);
        expect(mockCreate).toHaveBeenCalledTimes(2);
        const vars = JSON.parse(mockCreate.mock.calls[0][0].contentVariables);
        expect(vars['2']).toBe('Guasto alla cucina');

        const slots = await models.ShiftSlot.findAll({ where: { date }, order: [['startTime', 'ASC']] });
        expect(slots.map((s) => s.bookedCovers)).toEqual([0, 2]);
    });

    test('un giorno intero se non si indica il turno; il messaggio è obbligatorio', async () => {
        const date = futureDate(5);
        await createBooking(bookingInput({ date, phone: uniquePhone(1) }), { source: 'online' });
        await createBooking(bookingInput({ date, startTime: '21:00', phone: uniquePhone(2) }), { source: 'online' });

        const noMessage = await request(app).post('/api/admin/reservations/bulk-cancel').set(auth()).send({ date });
        expect(noMessage.status).toBe(400);

        const res = await request(app).post('/api/admin/reservations/bulk-cancel').set(auth()).send({ date, message: 'Chiusi per lutto' });
        expect(res.body.cancelled).toBe(2);
    });
});

describe('impostazioni e statistiche', () => {
    test('aggiorna cutoff e testo dei posti insufficienti, usati subito dal form pubblico', async () => {
        const put = await request(app).put('/api/admin/settings').set(auth())
            .send({ cutoffMinutes: 60, insufficientSeatsMessage: 'Non ci sono abbastanza posti.' });
        expect(put.status).toBe(200);

        const avail = await request(app).get(`/api/availability?date=${futureDate(3)}`);
        expect(avail.body.insufficientSeatsMessage).toBe('Non ci sono abbastanza posti.');
    });

    test('rifiuta valori non validi e non consente di cambiare la finestra di 30 giorni', async () => {
        const bad = await request(app).put('/api/admin/settings').set(auth()).send({ cutoffMinutes: -5 });
        expect(bad.status).toBe(400);
        await request(app).put('/api/admin/settings').set(auth()).send({ bookingWindowDays: 90 });
        const get = await request(app).get('/api/admin/settings').set(auth());
        expect(get.body.bookingWindowDays).toBe(30);
    });

    test('statistiche: coperti per settimana, tasso no-show e turno più richiesto', async () => {
        const date = futureDate(3);
        await createBooking(bookingInput({ date, phone: uniquePhone(1), guests: 4 }), { source: 'online' });
        await createBooking(bookingInput({ date, startTime: '13:00', phone: uniquePhone(2), guests: 2 }), { source: 'online' });
        const res = await request(app).get(`/api/admin/stats?from=${date}&to=${date}`).set(auth());
        expect(res.status).toBe(200);
        expect(res.body.weeklyCovers.reduce((s, w) => s + w.covers, 0)).toBe(6);
        expect(res.body.topShift.startTime).toBe('19:30');
        expect(res.body.noShowRate).toBe(0);
    });
});

describe('webhook Twilio', () => {
    beforeEach(() => { process.env.TWILIO_AUTH_TOKEN = 'tok'; process.env.PUBLIC_BASE_URL = 'https://example.test'; });

    test('rifiuta richieste con firma non valida', async () => {
        mockValidate.mockReturnValue(false);
        const res = await request(app).post('/api/webhooks/twilio/status').type('form').send({ MessageSid: 'SM1', MessageStatus: 'failed' });
        expect(res.status).toBe(403);
    });

    test('un messaggio non consegnato attiva il fallback email e segna la prenotazione', async () => {
        mockValidate.mockReturnValue(true);
        const r = await createBooking(bookingInput({ date: futureDate(5) }), { source: 'online' });
        await models.NotificationLog.create({ reservationId: r.id, event: 'confirmation', channel: 'whatsapp', status: 'sent', providerSid: 'SM9' });

        const res = await request(app).post('/api/webhooks/twilio/status').type('form')
            .send({ MessageSid: 'SM9', MessageStatus: 'undelivered', ErrorCode: '63016' });
        expect(res.status).toBe(200);

        expect((await r.reload()).notificationStatus).toBe('failed');
        const email = await models.NotificationLog.findOne({ where: { reservationId: r.id, channel: 'email' } });
        expect(email.status).toBe('skipped_email_todo');
    });

    test('i messaggi in arrivo con firma non valida sono rifiutati', async () => {
        mockValidate.mockReturnValue(false);
        const res = await request(app).post('/api/webhooks/twilio/incoming').type('form').send({ From: 'whatsapp:+39333', Body: 'Ciao' });
        expect(res.status).toBe(403);
    });

    test('un messaggio in arrivo riceve la risposta fissa con il contatto del ristorante', async () => {
        mockValidate.mockReturnValue(true);
        const res = await request(app).post('/api/webhooks/twilio/incoming').type('form').send({ From: 'whatsapp:+39333', Body: 'Ciao' });
        expect(res.status).toBe(200);
        expect(res.type).toBe('text/xml');
        expect(res.text).toContain('<Message>Per modifiche o annullamenti chiama il +39 366 357 5967</Message>');
    });

    test('la risposta ai messaggi in arrivo usa il testo salvato nelle impostazioni', async () => {
        mockValidate.mockReturnValue(true);
        await updateSettings({ incomingReplyText: 'Chiamaci allo 081 000 000 & scegli <un turno>' });
        const res = await request(app).post('/api/webhooks/twilio/incoming').type('form').send({ From: 'whatsapp:+39333', Body: 'Ciao' });
        expect(res.text).toContain('<Message>Chiamaci allo 081 000 000 &amp; scegli &lt;un turno&gt;</Message>');
    });

    test('il telefono del ristorante è esposto nella disponibilità pubblica e modificabile', async () => {
        expect((await request(app).get(`/api/availability?date=${futureDate(3)}`)).body.restaurantPhone).toBe('+39 366 357 5967');
        await updateSettings({ restaurantPhone: '+39 081 123 4567' });
        expect((await request(app).get(`/api/availability?date=${futureDate(3)}`)).body.restaurantPhone).toBe('+39 081 123 4567');
    });

    test('il telefono del ristorante deve essere valido', async () => {
        await expect(updateSettings({ restaurantPhone: 'chiamami' })).rejects.toThrow(/telefono del ristorante/);
        await expect(updateSettings({ restaurantPhone: '  ' })).rejects.toThrow(/telefono del ristorante/);
    });

    test('il testo della risposta automatica non può essere vuoto', async () => {
        await expect(updateSettings({ incomingReplyText: '   ' })).rejects.toThrow(/risposta automatica/);
    });
});

test('nessuna route admin è accessibile senza token', async () => {
    const paths = ['/api/admin/reservations', '/api/admin/settings', '/api/admin/stats', '/api/admin/noshow-flags'];
    for (const p of paths) expect((await request(app).get(p)).status).toBe(401);
    expect(romeInstant).toBeDefined();
});

describe('esito revisione', () => {
    test('un secondo annullamento della stessa prenotazione non invia un\'altra notifica', async () => {
        const r = await createBooking(bookingInput({ date: futureDate(4) }), { source: 'online' });
        await updateSettings({ whatsappTemplates: { cancellation: { contentSid: 'HXc', variables: ['name'] } } });
        process.env.TWILIO_ACCOUNT_SID = 'AC1'; process.env.TWILIO_AUTH_TOKEN = 't'; process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1';

        await request(app).post(`/api/admin/reservations/${r.id}/cancel`).set(auth());
        await request(app).post(`/api/admin/reservations/${r.id}/cancel`).set(auth());
        await flushNotifications();
        expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    test('un id non numerico dà 400 e non 500', async () => {
        const res = await request(app).post('/api/admin/reservations/abc/cancel').set(auth());
        expect(res.status).toBe(400);
    });

    test('il login senza password risponde 400 senza esporre errori interni', async () => {
        const res = await request(app).post('/api/auth/login').send({ username: 'admin' });
        expect(res.status).toBe(400);
    });
});
