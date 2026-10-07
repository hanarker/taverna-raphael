const mockCreate = jest.fn();
jest.mock('twilio', () => jest.fn(() => ({ messages: { create: mockCreate } })));

const { resetDb, futureDate, bookingInput, models, sequelize } = require('./helpers/db');
const { createBooking } = require('../src/services/booking.service');
const { notifyCustomer } = require('../src/services/notifications/notifier');
const { updateSettings } = require('../src/services/settings.service');

const TEMPLATES = {
    confirmation: { contentSid: 'HXconf', variables: ['name', 'date', 'time', 'guests'] },
    cancellation: { contentSid: 'HXcanc', variables: ['name', 'date', 'time', 'message'] },
};

beforeEach(async () => {
    await resetDb();
    mockCreate.mockReset();
    process.env.TWILIO_ACCOUNT_SID = 'ACtest';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886';
    await updateSettings({ whatsappTemplates: TEMPLATES, ownerWhatsapp: '+390811234567' });
});
afterAll(() => sequelize.close());

async function makeReservation() {
    return createBooking(bookingInput({ date: futureDate(5) }), { source: 'online' });
}

describe('notifyCustomer', () => {
    test('invia il template WhatsApp configurato con le variabili nell\'ordine indicato', async () => {
        mockCreate.mockResolvedValue({ sid: 'SM1' });
        const reservation = await makeReservation();

        const result = await notifyCustomer('confirmation', reservation);

        expect(result.channel).toBe('whatsapp');
        const args = mockCreate.mock.calls[0][0];
        expect(args.contentSid).toBe('HXconf');
        expect(args.to).toBe('whatsapp:+393331234567');
        expect(JSON.parse(args.contentVariables)).toMatchObject({ 1: 'Mario', 4: '2' });
        expect((await reservation.reload()).notificationStatus).toBe('sent');
    });

    test('se WhatsApp fallisce ripiega sull\'email (stub) e lo registra', async () => {
        mockCreate.mockRejectedValue(Object.assign(new Error('not a valid whatsapp user'), { code: 63003 }));
        const reservation = await makeReservation();

        const result = await notifyCustomer('confirmation', reservation);

        expect(result.channel).toBe('email');
        const logs = await models.NotificationLog.findAll({ where: { reservationId: reservation.id }, order: [['id', 'ASC']] });
        expect(logs.map((l) => `${l.channel}:${l.status}`)).toEqual(['whatsapp:failed', 'email:skipped_email_todo']);
        expect(logs[0].errorCode).toBe('63003');
        expect((await reservation.reload()).notificationStatus).toBe('failed');
    });

    test('senza template configurato non invia nulla e non fa fallback', async () => {
        const reservation = await makeReservation();
        const result = await notifyCustomer('reminder_24h', reservation);
        expect(result.status).toBe('not_configured');
        expect(mockCreate).not.toHaveBeenCalled();
    });

    test('senza credenziali Twilio funziona in dry-run senza chiamare l\'API', async () => {
        delete process.env.TWILIO_ACCOUNT_SID;
        const reservation = await makeReservation();
        const result = await notifyCustomer('confirmation', reservation);
        expect(result.status).toBe('dry_run');
        expect(mockCreate).not.toHaveBeenCalled();
    });

    test('nel log delle notifiche non finiscono dati personali', async () => {
        mockCreate.mockResolvedValue({ sid: 'SM1' });
        const reservation = await makeReservation();
        await notifyCustomer('confirmation', reservation);
        const log = (await models.NotificationLog.findAll({ raw: true }))[0];
        expect(JSON.stringify(log)).not.toMatch(/Mario|333|example\.com/);
    });
});

describe('esito revisione: idempotenza webhook', () => {
    test('un callback failed ripetuto non duplica il fallback', async () => {
        const { handleStatusCallback } = require('../src/services/notifications/notifier');
        const r = await makeReservation();
        await models.NotificationLog.create({ reservationId: r.id, event: 'confirmation', channel: 'whatsapp', status: 'sent', providerSid: 'SMdup' });

        await handleStatusCallback({ MessageSid: 'SMdup', MessageStatus: 'failed' });
        await handleStatusCallback({ MessageSid: 'SMdup', MessageStatus: 'failed' });

        expect(await models.NotificationLog.count({ where: { reservationId: r.id, channel: 'email' } })).toBe(1);
    });
});
