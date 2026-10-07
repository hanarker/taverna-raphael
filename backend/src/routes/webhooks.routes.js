const express = require('express');
const twilio = require('twilio');
const { handleStatusCallback } = require('../services/notifications/notifier');
const { getSettings } = require('../services/settings.service');

const router = express.Router();
const parseForm = express.urlencoded({ extended: false });

// Verifica X-Twilio-Signature sull'URL pubblico (PUBLIC_BASE_URL + percorso) e sul corpo form-urlencoded.
function requireTwilioSignature(req, res, next) {
    const signature = req.get('X-Twilio-Signature') ?? '';
    const url = `${process.env.PUBLIC_BASE_URL ?? ''}${req.originalUrl}`;
    const isValid = Boolean(process.env.TWILIO_AUTH_TOKEN)
        && twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, req.body);
    if (!isValid) return res.status(403).json({ error: 'Firma non valida.' });
    return next();
}

function escapeXml(text) {
    return text.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]));
}

// Callback di stato dei messaggi Twilio.
router.post('/twilio/status', parseForm, requireTwilioSignature, async (req, res) => {
    try {
        await handleStatusCallback(req.body);
        return res.sendStatus(200);
    } catch (error) {
        console.error('[webhook twilio]', error);
        return res.sendStatus(500);
    }
});

// Messaggio in arrivo da un cliente: risposta TwiML fissa (testo in Impostazioni, `incomingReplyText`).
// Il contenuto del messaggio ricevuto non viene letto né salvato.
router.post('/twilio/incoming', parseForm, requireTwilioSignature, async (req, res) => {
    try {
        const { incomingReplyText } = await getSettings();
        return res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(incomingReplyText)}</Message></Response>`);
    } catch (error) {
        console.error('[webhook twilio]', error);
        return res.sendStatus(500);
    }
});

module.exports = router;
