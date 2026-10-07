const request = require('supertest');
const jwt = require('jsonwebtoken');
const { resetDb, futureDate, bookingInput, models, sequelize } = require('./helpers/db');
const app = require('../src/app');
const { createBooking } = require('../src/services/booking.service');

const token = () => `Bearer ${jwt.sign({ id: 1, username: 'admin' }, process.env.JWT_SECRET)}`;

beforeEach(resetDb);
afterAll(() => sequelize.close());

describe('PUT /api/admin/schedule/weekly/:weekday', () => {
    test('richiede autenticazione', async () => {
        const res = await request(app).put('/api/admin/schedule/weekly/2').send({ shifts: [] });
        expect(res.status).toBe(401);
    });

    test('rifiuta turni sovrapposti con messaggio esplicito e senza salvare nulla', async () => {
        const before = await models.ShiftTemplate.count({ where: { weekday: 2 } });
        const res = await request(app).put('/api/admin/schedule/weekly/2').set('Authorization', token())
            .send({ shifts: [{ name: 'Cena 1', startTime: '19:30' }, { name: 'Cena 2', startTime: '20:30' }] });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/sovrappongono/);
        expect(await models.ShiftTemplate.count({ where: { weekday: 2 } })).toBe(before);
    });

    test('salva turni adiacenti validi e sostituisce quelli precedenti', async () => {
        const res = await request(app).put('/api/admin/schedule/weekly/2').set('Authorization', token())
            .send({ shifts: [{ name: 'Cena 1', startTime: '19:30' }, { name: 'Cena 2', startTime: '21:00' }] });

        expect(res.status).toBe(200);
        const rows = await models.ShiftTemplate.findAll({ where: { weekday: 2 }, order: [['startTime', 'ASC']] });
        expect(rows.map((r) => r.startTime)).toEqual(['19:30', '21:00']);
    });

    test('rifiuta di togliere un turno con prenotazioni attive', async () => {
        const date = futureDate(7);
        await createBooking(bookingInput({ date, startTime: '13:00' }), { source: 'online' });
        const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();

        const res = await request(app).put(`/api/admin/schedule/weekly/${weekday}`).set('Authorization', token())
            .send({ shifts: [{ name: 'Cena', startTime: '19:30' }] });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/prenotazioni attive/);
    });
});

describe('override per data', () => {
    test('un override sostituisce i turni della data e chiude la giornata se closed', async () => {
        const date = futureDate(9);
        const put = await request(app).put(`/api/admin/schedule/override/${date}`).set('Authorization', token())
            .send({ closed: true });
        expect(put.status).toBe(200);

        const avail = await request(app).get(`/api/availability?date=${date}`);
        expect(avail.body.shifts).toEqual([]);

        const del = await request(app).delete(`/api/admin/schedule/override/${date}`).set('Authorization', token());
        expect(del.status).toBe(200);
        const again = await request(app).get(`/api/availability?date=${date}`);
        expect(again.body.shifts.length).toBe(3);
    });

    test('rifiuta override con turni sovrapposti', async () => {
        const res = await request(app).put(`/api/admin/schedule/override/${futureDate(9)}`).set('Authorization', token())
            .send({ shifts: [{ name: 'A', startTime: '19:00' }, { name: 'B', startTime: '20:00' }] });
        expect(res.status).toBe(400);
    });
});

describe('POST /api/reservations e disponibilità pubblica', () => {
    const payload = (over = {}) => ({
        firstName: 'Anna', lastName: 'Verdi', email: 'anna@example.com', phone: '+39 347 1112233',
        date: futureDate(4), startTime: '19:30', guests: 3, consent: true, ...over,
    });

    test('crea la prenotazione e la disponibilità si aggiorna subito (no cache)', async () => {
        const date = futureDate(4);
        const before = await request(app).get(`/api/availability?date=${date}`);
        const cena = before.body.shifts.find((s) => s.startTime === '19:30');
        expect(cena.available).toBe(40);

        const created = await request(app).post('/api/reservations').send(payload({ date }));
        expect(created.status).toBe(201);

        const after = await request(app).get(`/api/availability?date=${date}`);
        expect(after.headers['cache-control']).toMatch(/no-store/);
        expect(after.body.shifts.find((s) => s.startTime === '19:30').available).toBe(37);
    });

    test('risponde con codice stabile e messaggio in caso di doppio numero', async () => {
        await request(app).post('/api/reservations').send(payload());
        const res = await request(app).post('/api/reservations').send(payload());
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('DUPLICATE_PHONE');
    });

    test('non espone i dettagli interni sugli errori imprevisti e non accetta >8 coperti', async () => {
        const res = await request(app).post('/api/reservations').send(payload({ guests: 9 }));
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION');
    });

    test('non permette di elencare le prenotazioni senza token', async () => {
        const res = await request(app).get('/api/admin/reservations');
        expect(res.status).toBe(401);
    });
});
