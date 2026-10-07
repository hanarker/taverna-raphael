const cron = require('node-cron');
const { sendDueReminders24h, sendMorningReminders } = require('../services/reminders.service');
const { runRetention } = require('../services/retention.service');
const { TIMEZONE } = require('../utils/shifts');

const options = { timezone: TIMEZONE };

function safely(name, job) {
    return async () => {
        try {
            const result = await job();
            if (result !== undefined) console.info(`[job ${name}]`, result);
        } catch (error) {
            console.error(`[job ${name}] fallito`, error);
        }
    };
}

// I job girano nel processo del backend (un solo container). Con più istanze servirebbe un lock distribuito.
// Se il server è spento alle 09:00 il reminder della mattina di quel giorno non viene recuperato.
function startScheduler() {
    if (process.env.DISABLE_SCHEDULER === '1') return;
    cron.schedule('*/5 * * * *', safely('reminder-24h', () => sendDueReminders24h()), options);
    cron.schedule('0 9 * * *', safely('reminder-mattina', () => sendMorningReminders()), options);
    cron.schedule('30 3 * * *', safely('retention', () => runRetention()), options);
}

module.exports = { startScheduler };
