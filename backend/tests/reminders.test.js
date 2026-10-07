const mockCreate = jest.fn().mockResolvedValue({ sid: 'SM1' });
jest.mock('twilio', () => jest.fn(() => ({ messages: { create: mockCreate } })));

const { resetDb, futureDate, bookingInput, sequelize, models } = require('./helpers/db');
const { createBooking } = require('../src/services/booking.service');
const { updateSettings } = require('../src/services/settings.service');
const { sendDueReminders24h, sendMorningReminders } = require('../src/services/reminders.service');
const { romeInstant, MS_PER_MINUTE } = require('../src/utils/time');

const HOUR = 60 * MS_PER_MINUTE;

beforeEach(async () => {
    await resetDb();
    mockCreate.mockClear();
    process.env.TWILIO_ACCOUNT_SID = 'ACtest';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886';
    await updateSettings({
        whatsappTemplates: {
            reminder_24h: { contentSid: 'HX24', variables: ['name', 'time', 'contact'] },
            reminder_morning: { contentSid: 'HXam', variables: ['name', 'time', 'contact'] },
        },
        cancellationContactText: 'Per disdire chiama 081 1234567',
    });
});
afterAll(() => sequelize.close());

// Prenotazione creata molto prima (createdAt retrodatato) per il turno delle 19:30 tra 5 giorni.
async function reservationCreatedEarly() {
    const date = futureDate(5);
    const r = await createBooking(bookingInput({ date }), { source: 'online' });
    await models.Reservation.update({ createdAt: new Date(Date.now() - 10 * 24 * HOUR) }, { where: { id: r.id }, silent: true });
    return { r, start: romeInstant(date, '19:30') };
}

describe('reminder 24 ore prima', () => {
    test('non invia prima della finestra di 24 ore', async () => {
        const { start } = await reservationCreatedEarly();
        await sendDueReminders24h(new Date(start.getTime() - 30 * HOUR));
        expect(mockCreate).not.toHaveBeenCalled();
    });

    test('invia nella finestra, include le indicazioni di disdetta e non lo ripete', async () => {
        const { start } = await reservationCreatedEarly();
        const now = new Date(start.getTime() - 23 * HOUR);

        await sendDueReminders24h(now);
        await sendDueReminders24h(new Date(now.getTime() + 5 * MS_PER_MINUTE));

        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate.mock.calls[0][0].contentSid).toBe('HX24');
        expect(mockCreate.mock.calls[0][0].contentVariables).toContain('081 1234567');
    });

    test('non invia per prenotazioni annullate', async () => {
        const { r, start } = await reservationCreatedEarly();
        await r.update({ status: 'cancelled' });
        await sendDueReminders24h(new Date(start.getTime() - 23 * HOUR));
        expect(mockCreate).not.toHaveBeenCalled();
    });

    test('salta il reminder se la prenotazione è stata fatta meno di 24 ore prima del turno', async () => {
        const date = futureDate(5);
        const r = await createBooking(bookingInput({ date }), { source: 'online' });
        const start = romeInstant(date, '19:30');
        await models.Reservation.update({ createdAt: new Date(start.getTime() - 3 * HOUR) }, { where: { id: r.id }, silent: true });

        await sendDueReminders24h(new Date(start.getTime() - 2 * HOUR));
        expect(mockCreate).not.toHaveBeenCalled();
    });
});

describe('reminder della mattina (09:00)', () => {
    test('invia il giorno del turno a chi ha prenotato prima delle 09:00', async () => {
        const { r, start } = await reservationCreatedEarly();
        const date = futureDate(5);
        const nineAm = romeInstant(date, '09:00');

        await sendMorningReminders(nineAm);
        await sendMorningReminders(nineAm);

        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate.mock.calls[0][0].contentSid).toBe('HXam');
        expect((await r.reload()).reminderMorningAt).not.toBeNull();
        expect(start.getTime()).toBeGreaterThan(nineAm.getTime());
    });

    test('non invia per turni di altri giorni', async () => {
        await reservationCreatedEarly();
        await sendMorningReminders(romeInstant(futureDate(2), '09:00'));
        expect(mockCreate).not.toHaveBeenCalled();
    });
});
