const { weekdayOf, addDaysToISO } = require('../utils/time');

const DAYS_IN_WEEK = 7;

// Lunedì della settimana che contiene la data (le settimane iniziano di lunedì).
function weekStartOf(date) {
    const offsetFromMonday = (weekdayOf(date) + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK;
    return addDaysToISO(date, -offsetFromMonday);
}

// Funzione pura. Riga = { date, startTime, shiftName, reservations, covers, noShows }.
function aggregateStats(rows) {
    const weekly = new Map();
    const shifts = new Map();
    let totalReservations = 0;
    let noShows = 0;

    for (const row of rows) {
        const week = weekStartOf(row.date);
        weekly.set(week, (weekly.get(week) ?? 0) + row.covers);

        const shiftKey = `${row.startTime}|${row.shiftName}`;
        const shift = shifts.get(shiftKey) ?? { startTime: row.startTime, shiftName: row.shiftName, covers: 0 };
        shifts.set(shiftKey, { ...shift, covers: shift.covers + row.covers });

        totalReservations += row.reservations;
        noShows += row.noShows;
    }

    const topShift = [...shifts.values()].sort((a, b) => b.covers - a.covers || a.startTime.localeCompare(b.startTime))[0] ?? null;
    return {
        weeklyCovers: [...weekly.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([weekStart, covers]) => ({ weekStart, covers })),
        totalReservations,
        noShows,
        noShowRate: totalReservations === 0 ? 0 : (noShows / totalReservations) * 100,
        topShift,
    };
}

module.exports = { aggregateStats, weekStartOf };
