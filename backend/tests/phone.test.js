const { normalizePhone, hashPhone } = require('../src/utils/phone');

describe('normalizePhone', () => {
    test('normalizza formati diversi dello stesso numero italiano nello stesso E.164', () => {
        const variants = ['+39 333 1234567', '+39-333-1234567', '+393331234567', '0039 333 123 4567'];
        const results = variants.map((v) => normalizePhone(v));
        expect(new Set(results).size).toBe(1);
        expect(results[0]).toBe('+393331234567');
    });

    test('restituisce null se manca il prefisso internazionale', () => {
        expect(normalizePhone('333 1234567')).toBeNull();
    });

    test('restituisce null per numeri non validi o vuoti', () => {
        expect(normalizePhone('+39 12')).toBeNull();
        expect(normalizePhone('')).toBeNull();
        expect(normalizePhone(undefined)).toBeNull();
    });
});

describe('hashPhone', () => {
    test('è deterministico e non contiene il numero in chiaro', () => {
        const h = hashPhone('+393331234567');
        expect(h).toBe(hashPhone('+393331234567'));
        expect(h).not.toContain('333');
        expect(h).toMatch(/^[0-9a-f]{64}$/);
    });

    test('numeri diversi producono hash diversi', () => {
        expect(hashPhone('+393331234567')).not.toBe(hashPhone('+393331234568'));
    });
});
