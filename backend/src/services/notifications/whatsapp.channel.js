const twilio = require('twilio');

let cachedClient = null;
let cachedKey = null;

function hasCredentials() {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);
}

function getClient() {
    const key = `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`;
    if (!cachedClient || cachedKey !== key) {
        cachedClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        cachedKey = key;
    }
    return cachedClient;
}

function statusCallbackUrl() {
    const base = process.env.PUBLIC_BASE_URL || '';
    return base.startsWith('https://') ? `${base}/api/webhooks/twilio/status` : undefined;
}

// Invia un template WhatsApp approvato (Content API). Lancia in caso di errore: il chiamante decide il fallback.
async function sendTemplate({ toE164, contentSid, contentVariables }) {
    const message = await getClient().messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${toE164}`,
        contentSid,
        contentVariables: JSON.stringify(contentVariables),
        statusCallback: statusCallbackUrl(),
    });
    return { sid: message.sid };
}

module.exports = { sendTemplate, hasCredentials };
