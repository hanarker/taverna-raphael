// Baseline del sistema di prenotazione: crea le tabelle nuove, migra le prenotazioni legacy
// (colonna `turn` fissa) verso ShiftSlot e inserisce lo schema settimanale di default.
const { QueryTypes } = require('sequelize');

const LEGACY_TURNS = {
    lunch: { name: 'Pranzo', startTime: '13:00' },
    dinner1: { name: 'Cena 1', startTime: '19:30' },
    dinner2: { name: 'Cena 2', startTime: '21:30' },
};

// ASSUNZIONE: schema di default = orari storici del ristorante, lunedì chiuso.
// Il titolare lo modifica da backoffice; serve solo perché il sito sia prenotabile subito dopo il deploy.
const DEFAULT_WEEKLY_SHIFTS = [
    { name: 'Pranzo', startTime: '13:00' },
    { name: 'Cena 1', startTime: '19:30' },
    { name: 'Cena 2', startTime: '21:30' },
];
const CLOSED_WEEKDAY = 1;

async function renameLegacyReservations(sequelize) {
    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    if (tables.includes('Reservations_legacy')) {
        return sequelize.query('SELECT * FROM Reservations_legacy', { type: QueryTypes.SELECT });
    }
    if (!tables.includes('Reservations')) return [];

    // Ripresa dopo un'esecuzione interrotta: la tabella legacy esiste già, la si rilegge senza rinominare di nuovo.
    if (tables.includes('Reservations_legacy')) {
        return sequelize.query('SELECT * FROM Reservations_legacy', { type: QueryTypes.SELECT });
    }
    const columns = await qi.describeTable('Reservations');
    if (!columns.turn) return [];

    const rows = await sequelize.query('SELECT * FROM Reservations', { type: QueryTypes.SELECT });
    await qi.renameTable('Reservations', 'Reservations_legacy');
    return rows;
}

function legacyPhone(raw, { normalizePhone, hashPhone }) {
    const digits = String(raw ?? '').trim();
    const e164 = normalizePhone(digits) || normalizePhone(`+39${digits.replace(/\D/g, '')}`);
    const phone = e164 || digits.slice(0, 20) || 'sconosciuto';
    return { phone, phoneHash: hashPhone(phone) };
}

async function importLegacy(rows, sequelize, models, phoneUtils) {
    for (const row of rows) {
        const turn = LEGACY_TURNS[row.turn];
        if (row.status === 'cancelled') continue; // annullate: nessun motivo di conservare i dati personali
        if (!turn) {
            console.warn(`[migrazione] prenotazione legacy ${row.id} con turno sconosciuto "${row.turn}": non importata`);
            continue;
        }

        const [slot] = await models.ShiftSlot.findOrCreate({
            where: { date: row.date, startTime: turn.startTime },
            defaults: { name: turn.name },
        });
        const { phone, phoneHash } = legacyPhone(row.phone, phoneUtils);
        const duplicate = await models.Reservation.findOne({ where: { shiftSlotId: slot.id, phone, status: 'confirmed' } });
        if (duplicate) continue;

        await models.Reservation.create({
            shiftSlotId: slot.id, firstName: row.firstName, lastName: row.lastName, email: row.email,
            phone, phoneHash, guests: row.guests, notes: row.notes, source: 'backoffice', status: 'confirmed',
        });
        await slot.increment('bookedCovers', { by: row.guests });
    }
}

async function seedDefaultSchedule(ShiftTemplate) {
    if ((await ShiftTemplate.count()) > 0) return;
    const rows = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
        if (weekday === CLOSED_WEEKDAY) continue;
        DEFAULT_WEEKLY_SHIFTS.forEach((shift) => rows.push({ weekday, ...shift }));
    }
    await ShiftTemplate.bulkCreate(rows);
}

module.exports = {
    async up({ context: sequelize }) {
        const legacyRows = await renameLegacyReservations(sequelize);

        const models = require('../src/models');
        await sequelize.sync(); // crea solo le tabelle mancanti, senza alter

        await importLegacy(legacyRows, sequelize, models, require('../src/utils/phone'));
        await seedDefaultSchedule(models.ShiftTemplate);

        if (legacyRows.length > 0) await sequelize.getQueryInterface().dropTable('Reservations_legacy');
    },

    async down() {
        throw new Error('Migrazione non reversibile: ripristinare dal backup.');
    },
};
