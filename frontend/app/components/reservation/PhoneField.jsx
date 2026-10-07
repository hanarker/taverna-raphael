'use client';

// Prefissi più comuni; il backend valida comunque il numero completo (E.164).
export const DEFAULT_DIAL_CODE = '+39';
const DIAL_CODES = [
  { code: '+39', label: 'IT +39' },
  { code: '+41', label: 'CH +41' },
  { code: '+43', label: 'AT +43' },
  { code: '+44', label: 'GB +44' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+34', label: 'ES +34' },
  { code: '+31', label: 'NL +31' },
  { code: '+32', label: 'BE +32' },
  { code: '+351', label: 'PT +351' },
  { code: '+48', label: 'PL +48' },
  { code: '+30', label: 'GR +30' },
  { code: '+46', label: 'SE +46' },
  { code: '+47', label: 'NO +47' },
  { code: '+45', label: 'DK +45' },
  { code: '+353', label: 'IE +353' },
  { code: '+1', label: 'US/CA +1' },
  { code: '+55', label: 'BR +55' },
  { code: '+61', label: 'AU +61' },
];

/**
 * @param {{ dialCode: string, number: string, onChange: (patch: { dialCode?: string, phoneNumber?: string }) => void }} props
 */
export default function PhoneField({ dialCode, number, onChange }) {
  return (
    <div className="phone-field">
      <label htmlFor="dialCode" className="sr-only">Prefisso internazionale</label>
      <select id="dialCode" value={dialCode} onChange={(e) => onChange({ dialCode: e.target.value })} aria-label="Prefisso internazionale">
        {DIAL_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
      </select>
      <input
        id="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={number}
        onChange={(e) => onChange({ phoneNumber: e.target.value })}
        required
        placeholder="333 1234567"
        aria-label="Numero di telefono"
      />

      <style jsx>{`
        .phone-field { display: grid; grid-template-columns: 7.5rem minmax(0, 1fr); gap: var(--s-2); }
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        select, input {
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          color: var(--color-paper);
          padding: var(--s-3) var(--s-2) var(--s-3) var(--s-3);
          min-height: 44px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          color-scheme: dark;
          min-width: 0;
          width: 100%;
        }
        select:focus, input:focus { border-color: var(--color-brass-bright); outline: none; }
        select:focus-visible, input:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        input::placeholder { color: var(--color-text-dim); font-style: italic; opacity: 0.8; }
      `}</style>
    </div>
  );
}
