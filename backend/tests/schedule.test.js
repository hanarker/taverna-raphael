const { validateNoOverlap } = require('../src/services/schedule.rules');

describe('validateNoOverlap', () => {
    test('accetta turni adiacenti che non si sovrappongono (19:30 e 21:00)', () => {
        const result = validateNoOverlap([
            { name: 'Cena 1', startTime: '19:30' },
            { name: 'Cena 2', startTime: '21:00' },
        ]);
        expect(result.valid).toBe(true);
    });

    test('rifiuta turni sovrapposti con messaggio esplicito (19:30 e 20:30)', () => {
        const result = validateNoOverlap([
            { name: 'Cena 1', startTime: '19:30' },
            { name: 'Cena 2', startTime: '20:30' },
        ]);
        expect(result.valid).toBe(false);
        expect(result.message).toMatch(/Cena 1/);
        expect(result.message).toMatch(/Cena 2/);
        expect(result.message).toMatch(/sovrappon/i);
    });

    test('rifiuta due turni con lo stesso orario di inizio', () => {
        const result = validateNoOverlap([
            { name: 'A', startTime: '13:00' },
            { name: 'B', startTime: '13:00' },
        ]);
        expect(result.valid).toBe(false);
    });

    test('non dipende dall\'ordine di inserimento', () => {
        const result = validateNoOverlap([
            { name: 'Cena 2', startTime: '20:00' },
            { name: 'Pranzo', startTime: '13:00' },
            { name: 'Cena 1', startTime: '19:00' },
        ]);
        expect(result.valid).toBe(false);
    });

    test('rifiuta orari malformati', () => {
        expect(validateNoOverlap([{ name: 'X', startTime: '25:99' }]).valid).toBe(false);
    });

    test('accetta un elenco vuoto o un solo turno', () => {
        expect(validateNoOverlap([]).valid).toBe(true);
        expect(validateNoOverlap([{ name: 'P', startTime: '13:00' }]).valid).toBe(true);
    });
});
