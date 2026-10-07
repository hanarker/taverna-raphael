const { aggregateStats } = require('../src/services/stats.rules');

const row = (date, startTime, shiftName, reservations, covers, noShows = 0) => ({ date, startTime, shiftName, reservations, covers, noShows });

describe('aggregateStats', () => {
    const rows = [
        row('2026-09-21', '19:30', 'Cena 1', 3, 10, 1), // lunedì settimana 38
        row('2026-09-23', '19:30', 'Cena 1', 2, 8, 0),  // stessa settimana
        row('2026-09-23', '13:00', 'Pranzo', 1, 2, 0),
        row('2026-09-28', '19:30', 'Cena 1', 4, 14, 1), // settimana successiva
    ];

    test('somma i coperti per settimana (settimana da lunedì)', () => {
        const stats = aggregateStats(rows);
        expect(stats.weeklyCovers).toEqual([
            { weekStart: '2026-09-21', covers: 20 },
            { weekStart: '2026-09-28', covers: 14 },
        ]);
    });

    test('calcola il tasso di no-show sul totale delle prenotazioni', () => {
        const stats = aggregateStats(rows);
        expect(stats.totalReservations).toBe(10);
        expect(stats.noShows).toBe(2);
        expect(stats.noShowRate).toBeCloseTo(20, 5);
    });

    test('indica il turno più richiesto per coperti', () => {
        expect(aggregateStats(rows).topShift).toEqual({ startTime: '19:30', shiftName: 'Cena 1', covers: 32 });
    });

    test('gestisce l\'assenza di dati senza dividere per zero', () => {
        expect(aggregateStats([])).toEqual({ weeklyCovers: [], totalReservations: 0, noShows: 0, noShowRate: 0, topShift: null });
    });
});
