const NotificationLog = require('../../models/NotificationLog');
const Reservation = require('../../models/Reservation');
const { getSettings } = require('../settings.service');
const { buildVariables, toContentVariables } = require('./templates');
const whatsapp = require('./whatsapp.channel');
const { sendEmail } = require('./email.channel');

const CUSTOMER_EVENTS = ['confirmation', 'reminder_24h', 'reminder_morning', 'cancellation', 'bulk_cancellation'];

async function loadSlot(reservation) {
    return reservation.getDataValue('slot') || reservation.getSlot();
}

function record(reservation, event, channel, status, extra = {}) {
    return NotificationLog.create({ reservationId: reservation?.id ?? null, event, channel, status, ...extra });
}

async function fallbackToEmail(event, reservation) {
    const { status } = await sendEmail(event, reservation);
    await record(reservation, event, 'email', status);
    await reservation.update({ notificationStatus: 'failed' });
    return { channel: 'email', status };
}

// Notifica il cliente via WhatsApp; se l'invio fallisce ripiega sull'email.
// Non lancia mai: un errore di notifica non deve invalidare la prenotazione già salvata.
async function notifyCustomer(event, reservation, extra = {}) {
    try {
        const settings = await getSettings();
        const template = settings.whatsappTemplates?.[event];

        if (!template?.contentSid) {
            await record(reservation, event, 'whatsapp', 'not_configured');
            return { channel: 'whatsapp', status: 'not_configured' };
        }
        if (!whatsapp.hasCredentials()) {
            console.info(`[whatsapp dry-run] evento=${event} prenotazione=${reservation.id}`);
            await record(reservation, event, 'whatsapp', 'dry_run');
            await reservation.update({ notificationStatus: 'skipped' });
            return { channel: 'whatsapp', status: 'dry_run' };
        }

        const slot = await loadSlot(reservation);
        const values = buildVariables(reservation, slot, settings, extra);
        try {
            const { sid } = await whatsapp.sendTemplate({
                toE164: reservation.phone,
                contentSid: template.contentSid,
                contentVariables: toContentVariables(template.variables ?? [], values),
            });
            await record(reservation, event, 'whatsapp', 'sent', { providerSid: sid });
            await reservation.update({ notificationStatus: 'sent' });
            return { channel: 'whatsapp', status: 'sent' };
        } catch (error) {
            await record(reservation, event, 'whatsapp', 'failed', { errorCode: String(error.code ?? 'unknown') });
            return await fallbackToEmail(event, reservation);
        }
    } catch (error) {
        console.error(`[notifica fallita] evento=${event} prenotazione=${reservation?.id} codice=${error?.code ?? error?.name}`);
        return { channel: 'none', status: 'error' };
    }
}

// Notifica al titolare con link wa.me al cliente (template "owner_new_reservation").
async function notifyOwner(reservation) {
    try {
        const settings = await getSettings();
        const template = settings.whatsappTemplates?.owner_new_reservation;
        if (!template?.contentSid || !settings.ownerWhatsapp) {
            await record(reservation, 'owner_new_reservation', 'whatsapp', 'not_configured');
            return { status: 'not_configured' };
        }
        if (!whatsapp.hasCredentials()) {
            console.info(`[whatsapp dry-run] notifica titolare prenotazione=${reservation.id}`);
            await record(reservation, 'owner_new_reservation', 'whatsapp', 'dry_run');
            return { status: 'dry_run' };
        }
        const slot = await loadSlot(reservation);
        const values = buildVariables(reservation, slot, settings);
        const { sid } = await whatsapp.sendTemplate({
            toE164: settings.ownerWhatsapp,
            contentSid: template.contentSid,
            contentVariables: toContentVariables(template.variables ?? [], values),
        });
        await record(reservation, 'owner_new_reservation', 'whatsapp', 'sent', { providerSid: sid });
        return { status: 'sent' };
    } catch (error) {
        console.error(`[notifica titolare fallita] prenotazione=${reservation?.id} codice=${error?.code ?? error?.name}`);
        await record(reservation, 'owner_new_reservation', 'whatsapp', 'failed', { errorCode: String(error?.code ?? 'unknown') }).catch(() => undefined);
        return { status: 'error' };
    }
}

// Callback di stato Twilio: un messaggio accettato ma poi non consegnato attiva il fallback email.
async function handleStatusCallback({ MessageSid, MessageStatus, ErrorCode }) {
    if (!['failed', 'undelivered'].includes(MessageStatus)) return;
    const log = await NotificationLog.findOne({ where: { providerSid: MessageSid, channel: 'whatsapp' } });
    if (!log || !CUSTOMER_EVENTS.includes(log.event)) return;
    if (log.status === MessageStatus) return; // retry del callback Twilio: già gestito

    await log.update({ status: MessageStatus, errorCode: ErrorCode ? String(ErrorCode) : log.errorCode });
    const reservation = log.reservationId ? await Reservation.findByPk(log.reservationId) : null;
    if (reservation) await fallbackToEmail(log.event, reservation);
}

module.exports = { notifyCustomer, notifyOwner, handleStatusCallback, CUSTOMER_EVENTS };
