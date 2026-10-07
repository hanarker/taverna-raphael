const ShiftTemplate = require('../models/ShiftTemplate');
const ShiftOverride = require('../models/ShiftOverride');
const ShiftSlot = require('../models/ShiftSlot');
const { BookingError } = require('./booking.errors');
const { validateNoOverlap } = require('./schedule.rules');
const { runAtomic } = require('./atomic');
const { weekdayOf, toISODate } = require('../utils/time');
const { cleanText } = require('../utils/sanitize');
const { Op } = require('sequelize');

const MAX_SHIFTS_PER_DAY = 6;

function byStartTime(a, b) {
    return a.startTime.localeCompare(b.startTime);
}

// Turni effettivi di una data: gli override (se presenti) sostituiscono i template del giorno.
async function resolveShiftsForDate(date, options = {}) {
    const { transaction } = options;
    const overrides = await ShiftOverride.findAll({ where: { date }, transaction });
    if (overrides.length > 0) {
        return overrides
            .filter((o) => !o.isClosed)
            .map((o) => ({ name: o.name, startTime: o.startTime }))
            .sort(byStartTime);
    }

    const templates = await ShiftTemplate.findAll({ where: { weekday: weekdayOf(date) }, transaction });
    return templates.map((t) => ({ name: t.name, startTime: t.startTime })).sort(byStartTime);
}

// Normalizza e valida l'elenco turni ricevuto dal backoffice. Rifiuta (mai corregge) input non validi.
function parseShiftInput(rawShifts) {
    if (!Array.isArray(rawShifts)) throw new BookingError('SCHEDULE_INVALID', 400, 'Elenco turni non valido.');
    if (rawShifts.length > MAX_SHIFTS_PER_DAY) {
        throw new BookingError('SCHEDULE_INVALID', 400, `Massimo ${MAX_SHIFTS_PER_DAY} turni per giornata.`);
    }
    const shifts = rawShifts.map((s) => ({
        name: cleanText(s?.name, 60),
        startTime: typeof s?.startTime === 'string' ? s.startTime.trim() : '',
    }));
    if (shifts.some((s) => !s.name)) throw new BookingError('SCHEDULE_INVALID', 400, 'Ogni turno deve avere un nome.');

    const overlap = validateNoOverlap(shifts);
    if (!overlap.valid) throw new BookingError('SCHEDULE_INVALID', 400, overlap.message);
    return shifts;
}

// Slot futuri con prenotazioni attive il cui turno non compare più nel nuovo elenco.
async function findOrphanedSlots(shiftsByDate, transaction) {
    const today = toISODate(new Date());
    const slots = await ShiftSlot.findAll({ where: { date: { [Op.gte]: today }, bookedCovers: { [Op.gt]: 0 } }, transaction });
    return slots.filter((slot) => {
        const allowed = shiftsByDate(slot.date);
        return allowed !== null && !allowed.some((s) => s.startTime === slot.startTime);
    });
}

function orphanError(orphans) {
    const list = orphans.map((s) => `${s.date} ${s.startTime}`).join(', ');
    return new BookingError('SCHEDULE_CONFLICT', 409,
        `Impossibile salvare: ci sono prenotazioni attive nei turni rimossi (${list}). Annullale prima dal backoffice.`);
}

async function replaceWeeklyShifts(weekday, rawShifts) {
    const shifts = parseShiftInput(rawShifts);
    return runAtomic(async (transaction) => {
        const overridden = new Set((await ShiftOverride.findAll({ attributes: ['date'], transaction })).map((o) => o.date));
        const orphans = await findOrphanedSlots(
            (date) => (weekdayOf(date) === weekday && !overridden.has(date) ? shifts : null), transaction);
        if (orphans.length > 0) throw orphanError(orphans);

        await ShiftTemplate.destroy({ where: { weekday }, transaction });
        await ShiftTemplate.bulkCreate(shifts.map((s) => ({ weekday, ...s })), { transaction });
        return shifts;
    });
}

async function replaceDateOverride(date, { closed, shifts: rawShifts }) {
    const shifts = closed ? [] : parseShiftInput(rawShifts);
    return runAtomic(async (transaction) => {
        const orphans = await findOrphanedSlots((slotDate) => (slotDate === date ? shifts : null), transaction);
        if (orphans.length > 0) throw orphanError(orphans);

        await ShiftOverride.destroy({ where: { date }, transaction });
        if (closed) {
            await ShiftOverride.create({ date, isClosed: true }, { transaction });
        } else {
            await ShiftOverride.bulkCreate(shifts.map((s) => ({ date, ...s })), { transaction });
        }
        return { date, closed: Boolean(closed), shifts };
    });
}

async function removeDateOverride(date) {
    return runAtomic(async (transaction) => {
        const templates = await ShiftTemplate.findAll({ where: { weekday: weekdayOf(date) }, transaction });
        const orphans = await findOrphanedSlots((slotDate) => (slotDate === date ? templates : null), transaction);
        if (orphans.length > 0) throw orphanError(orphans);
        await ShiftOverride.destroy({ where: { date }, transaction });
    });
}

async function getSchedule() {
    const templates = await ShiftTemplate.findAll({ order: [['weekday', 'ASC'], ['startTime', 'ASC']] });
    const overrides = await ShiftOverride.findAll({ order: [['date', 'ASC'], ['startTime', 'ASC']] });
    return { templates, overrides };
}

module.exports = {
    resolveShiftsForDate, replaceWeeklyShifts, replaceDateOverride, removeDateOverride, getSchedule,
};
