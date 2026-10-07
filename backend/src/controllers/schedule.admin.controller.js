const {
    replaceWeeklyShifts, replaceDateOverride, removeDateOverride, getSchedule,
} = require('../services/schedule.service');
const { sendError, isISODate } = require('../utils/http');

exports.getSchedule = async (req, res) => {
    try {
        res.json(await getSchedule());
    } catch (error) {
        sendError(res, error);
    }
};

exports.putWeekly = async (req, res) => {
    const weekday = Number(req.params.weekday);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
        return res.status(400).json({ code: 'VALIDATION', error: 'Giorno della settimana non valido (0-6).' });
    }
    try {
        res.json({ weekday, shifts: await replaceWeeklyShifts(weekday, req.body?.shifts) });
    } catch (error) {
        sendError(res, error);
    }
};

exports.putOverride = async (req, res) => {
    if (!isISODate(req.params.date)) return res.status(400).json({ code: 'VALIDATION', error: 'Data non valida.' });
    try {
        res.json(await replaceDateOverride(req.params.date, { closed: req.body?.closed === true, shifts: req.body?.shifts }));
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteOverride = async (req, res) => {
    if (!isISODate(req.params.date)) return res.status(400).json({ code: 'VALIDATION', error: 'Data non valida.' });
    try {
        await removeDateOverride(req.params.date);
        res.json({ message: 'Eccezione rimossa: la giornata torna allo schema settimanale.' });
    } catch (error) {
        sendError(res, error);
    }
};
