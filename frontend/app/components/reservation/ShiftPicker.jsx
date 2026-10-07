'use client';

const REASON_LABELS = {
  FULL: 'Al completo',
  CUTOFF_PASSED: 'Chiuso online',
  OUT_OF_WINDOW: 'Non prenotabile',
};

/**
 * Turni della data scelta, letti dal backend (configurati dal titolare).
 * @param {{ shifts: Array|null, selected: string, onSelect: (startTime: string) => void,
 *           isLoading: boolean, hasDate: boolean }} props
 */
export default function ShiftPicker({ shifts, selected, onSelect, isLoading, hasDate }) {
  const hasNoShifts = hasDate && shifts && shifts.length === 0;

  return (
    <fieldset className="turn-fieldset">
      <legend>Turno <span aria-hidden="true">*</span></legend>
      {!hasDate && <p className="hint">Scegli prima la data per vedere i turni disponibili.</p>}
      {isLoading && <p className="hint" aria-live="polite">Controllo disponibilità…</p>}
      {hasNoShifts && <p className="hint">Nessun turno disponibile in questa data (giorno di chiusura).</p>}

      <div className="turn-options">
        {(shifts ?? []).map((shift) => {
          const isDisabled = !shift.bookable;
          return (
            <label key={shift.startTime} className={`turn-option${isDisabled ? ' disabled' : ''}${selected === shift.startTime ? ' selected' : ''}`}>
              <input
                type="radio"
                name="startTime"
                value={shift.startTime}
                checked={selected === shift.startTime}
                onChange={() => onSelect(shift.startTime)}
                disabled={isDisabled}
              />
              <span className="turn-label">{shift.name}</span>
              <span className="turn-time">{shift.startTime}</span>
              {shift.reason && <span className="turn-badge">{REASON_LABELS[shift.reason] ?? shift.reason}</span>}
            </label>
          );
        })}
      </div>

      <style jsx>{`
        .turn-fieldset { border: none; padding: 0; margin: 0; }
        .turn-fieldset legend {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-dim);
          margin-bottom: var(--s-3);
          float: left;
          width: 100%;
        }
        .turn-fieldset legend span { color: var(--color-brass-bright); }
        .hint {
          font-size: 0.8125rem;
          color: var(--color-text-dim);
          font-style: italic;
          margin: var(--s-2) 0;
          clear: both;
        }
        .turn-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--s-3);
          clear: both;
          margin-top: var(--s-2);
        }
        @media (max-width: 600px) { .turn-options { grid-template-columns: 1fr; } }
        .turn-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--s-1);
          min-height: 44px;
          padding: var(--s-4) var(--s-3);
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          cursor: pointer;
          transition: border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
          position: relative;
          text-align: center;
        }
        .turn-option input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; }
        .turn-option:hover:not(.disabled) { border-color: var(--color-brass-bright); }
        .turn-option.selected { border-color: var(--color-brass-bright); background: rgba(201, 163, 95, 0.12); }
        .turn-option.disabled { opacity: 0.5; cursor: not-allowed; }
        .turn-option:focus-within { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        .turn-label { font-family: var(--font-body); font-weight: 600; font-size: 0.9375rem; color: var(--color-paper); }
        .turn-time { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-soft); }
        .turn-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-danger);
          background: rgba(217, 138, 125, 0.12);
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
          margin-top: var(--s-1);
        }
        @media (prefers-reduced-motion: reduce) { .turn-option { transition: none; } }
      `}</style>
    </fieldset>
  );
}
