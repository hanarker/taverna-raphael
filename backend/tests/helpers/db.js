const sequelize = require('../../src/config/db');
const models = require('../../src/models');
const { toISODate, addDays } = require('../../src/utils/time');

async function resetDb() {
    await sequelize.sync({ force: true });
    // Schema settimanale di test: tutti i giorni aperti con 3 turni non sovrapposti.
    const shifts = [
        { name: 'Pranzo', startTime: '13:00' },
        { name: 'Cena 1', startTime: '19:30' },
        { name: 'Cena 2', startTime: '21:00' },
    ];
    for (let weekday = 0; weekday < 7; weekday += 1) {
        for (const shift of shifts) await models.ShiftTemplate.create({ weekday, ...shift });
    }
}

// Data ISO a `days` giorni da oggi (fuso Europe/Rome).
function futureDate(days) {
    return toISODate(addDays(new Date(), days));
}

function bookingInput(overrides = {}) {
    return {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario@example.com',
        phone: '+39 333 1234567',
        date: futureDate(5),
        startTime: '19:30',
        guests: 2,
        consent: true,
        ...overrides,
    };
}

// Genera numeri italiani validi e distinti (+39 320 0000000 + i).
function uniquePhone(i) {
    return `+39 320 ${String(1000000 + i)}`;
}

module.exports = { resetDb, futureDate, bookingInput, uniquePhone, models, sequelize };
