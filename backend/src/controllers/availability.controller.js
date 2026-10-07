const { getAvailability } = require('../services/availability.service');
const { onAvailabilityChanged } = require('../services/availability.events');
const { sendError, isISODate } = require('../utils/http');

const SSE_HEARTBEAT_MS = 25000;
const MAX_STREAMS_TOTAL = 500;
const MAX_STREAMS_PER_IP = 5;
const streamsByIp = new Map();
let totalStreams = 0;

exports.getAvailability = async (req, res) => {
    const { date } = req.query;
    if (!isISODate(date)) return res.status(400).json({ code: 'VALIDATION', error: 'Parametro date obbligatorio (YYYY-MM-DD).' });

    try {
        // La disponibilità cambia a ogni prenotazione: mai in cache.
        res.set('Cache-Control', 'no-store');
        res.json(await getAvailability(date));
    } catch (error) {
        sendError(res, error);
    }
};

// Server-Sent Events: avvisa i form aperti quando cambia la capienza di una data.
exports.streamAvailability = (req, res) => {
    const ip = req.ip;
    if (totalStreams >= MAX_STREAMS_TOTAL || (streamsByIp.get(ip) ?? 0) >= MAX_STREAMS_PER_IP) {
        return res.status(429).json({ code: 'RATE_LIMITED', error: 'Troppe connessioni aperte.' });
    }
    totalStreams += 1;
    streamsByIp.set(ip, (streamsByIp.get(ip) ?? 0) + 1);

    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    res.write('retry: 5000\n\n');

    const unsubscribe = onAvailabilityChanged(({ date }) => res.write(`data: ${JSON.stringify({ date })}\n\n`));
    const heartbeat = setInterval(() => res.write(': ping\n\n'), SSE_HEARTBEAT_MS);

    let isReleased = false;
    const release = () => {
        if (isReleased) return;
        isReleased = true;
        clearInterval(heartbeat);
        unsubscribe();
        totalStreams -= 1;
        const remaining = (streamsByIp.get(ip) ?? 1) - 1;
        if (remaining <= 0) streamsByIp.delete(ip);
        else streamsByIp.set(ip, remaining);
    };
    req.on('close', release);
    res.on('error', release);
};
