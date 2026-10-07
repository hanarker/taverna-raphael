const { resetDb, bookingInput, uniquePhone, models, sequelize } = require('./helpers/db');
const { createBooking } = require('../src/services/booking.service');
const { runRetention } = require('../src/services/retention.service');
const { toISODate, addDays, romeInstant, MS_PER_DAY } = require('../src/utils/time');

beforeEach(resetDb);
afterAll(() => sequelize.close());

const NOW = new Date();
const daysAgo = (n) => toISODate(addDays(NOW, -n));

async function book(daysBack, startTime, guests, i, attendance) {
    const r = await createBooking(
        bookingInput({ date: daysAgo(daysBack), startTime, guests, phone: uniquePhone(i), firstName: `Nome${i}` }),
        { source: 'backoffice' });
    if (attendance) await r.update({ attendance });
    await models.NotificationLog.create({ reservationId: r.id, event: 'confirmation', channel: 'whatsapp', status: 'sent' });
    return r;
}

describe('job di anonimizzazione a 30 giorni', () => {
    test('aggrega e cancella (hard delete) i turni conclusi da oltre 30 giorni, lasciando gli altri', async () => {
        await book(31, '19:30', 4, 1, 'arrived');
        await book(31, '19:30', 2, 2, 'no_show');
        await book(31, '19:30', 3, 3, 'no_show');
        const recent = await book(29, '19:30', 5, 4);

        const result = await runRetention(NOW);

        // Prenotazioni vecchie: sparite davvero dal DB (query grezza, niente soft delete)
        const [oldRows] = await sequelize.query(`SELECT * FROM Reservations WHERE firstName IN ('Nome1','Nome2','Nome3')`);
        expect(oldRows).toHaveLength(0);
        expect(await models.NotificationLog.count({ where: { reservationId: [1, 2, 3] } })).toBe(0);
        expect(await models.ShiftSlot.count({ where: { date: daysAgo(31) } })).toBe(0);

        // Quelle entro 30 giorni restano intatte
        expect(await models.Reservation.findByPk(recent.id)).not.toBeNull();
        expect(await models.ShiftSlot.count({ where: { date: daysAgo(29) } })).toBe(1);

        // Aggregato anonimo corretto
        const stats = await models.StatsDaily.findOne({ where: { date: daysAgo(31), startTime: '19:30' } });
        expect(stats).toMatchObject({ reservations: 3, covers: 9, noShows: 2, noShowCovers: 5, shiftName: 'Cena 1' });
        expect(result).toMatchObject({ deletedReservations: 3, aggregatedSlots: 1 });
    });

    test('la tabella di aggregazione non contiene alcun dato identificativo', async () => {
        await book(40, '13:00', 2, 1);
        await runRetention(NOW);

        const columns = Object.keys(models.StatsDaily.rawAttributes);
        expect(columns.sort()).toEqual(
            ['covers', 'createdAt', 'date', 'id', 'noShowCovers', 'noShows', 'reservations', 'shiftName', 'startTime', 'updatedAt', 'weekday'].sort());
        const [rows] = await sequelize.query(`SELECT * FROM ${models.StatsDaily.getTableName()}`);
        expect(JSON.stringify(rows)).not.toMatch(/Nome1|\+39|example\.com/);
    });

    test('un turno appena concluso da 30 giorni esatti non viene ancora cancellato', async () => {
        await book(30, '21:00', 2, 1);
        // Adesso = fine turno (22:30 Rome di 30 giorni fa) + 30 giorni - 1 minuto
        const justBefore = new Date(romeInstant(daysAgo(30), '22:30').getTime() + 30 * MS_PER_DAY - 60 * 1000);
        await runRetention(justBefore);
        expect(await models.Reservation.count()).toBe(1);
        await runRetention(new Date(justBefore.getTime() + 2 * 60 * 1000));
        expect(await models.Reservation.count()).toBe(0);
    });

    test('è idempotente: rieseguirlo non raddoppia le statistiche', async () => {
        await book(35, '19:30', 4, 1);
        await runRetention(NOW);
        await runRetention(NOW);
        const stats = await models.StatsDaily.findAll();
        expect(stats).toHaveLength(1);
        expect(stats[0].covers).toBe(4);
    });

    test('non conta le prenotazioni annullate nelle statistiche ma le cancella comunque', async () => {
        const r = await book(35, '19:30', 4, 1);
        await require('../src/services/booking.service').cancelBooking(r.id);
        await book(35, '19:30', 2, 2);
        await runRetention(NOW);
        const stats = await models.StatsDaily.findOne();
        expect(stats).toMatchObject({ reservations: 1, covers: 2 });
        expect(await models.Reservation.count()).toBe(0);
    });
});
