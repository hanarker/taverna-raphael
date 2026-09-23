'use client';

import { useState } from 'react';

const ATTENDANCE_OPTIONS = [
  { value: 'arrived', label: 'Arrivato' },
  { value: 'late', label: 'In ritardo' },
  { value: 'no_show', label: 'No-show' },
];

/**
 * Riga di una prenotazione nella vista giornaliera. Le azioni (.no-print) non compaiono in stampa.
 * @param {{ reservation: object, onAttendance: Function, onEdit: Function, onCancel: Function, onToggleFlag: Function }} props
 */
export default function ReservationRow({ reservation: r, onAttendance, onEdit, onCancel, onToggleFlag }) {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const isCancelled = r.status === 'cancelled';
  const waLink = `https://wa.me/${r.phone.replace(/^\+/, '')}`;

  return (
    <tr className={isCancelled ? 'cancelled' : ''}>
      <td>
        <strong>{r.lastName} {r.firstName}</strong>
        {r.hasNoShowFlag && <span className="flag" title="Il numero ha un no-show precedente">⚠ no-show precedente</span>}
        {r.notificationStatus === 'failed' && <span className="warn">WhatsApp non recapitato</span>}
        {r.notes && <><br /><small className="notes">&ldquo;{r.notes}&rdquo;</small></>}
      </td>
      <td className="num">{r.guests}</td>
      <td>
        <a href={waLink} target="_blank" rel="noreferrer" className="phone">{r.phone}</a>
        <br /><small>{r.email}</small>
      </td>
      <td>
        {isCancelled ? <span className="badge">Annullata</span> : (
          <div className="attendance no-print" role="group" aria-label="Presenza">
            {ATTENDANCE_OPTIONS.map((o) => (
              <button key={o.value} type="button" className={r.attendance === o.value ? `on ${o.value}` : ''}
                aria-pressed={r.attendance === o.value}
                onClick={() => onAttendance(r, r.attendance === o.value ? null : o.value)}>{o.label}</button>
            ))}
          </div>
        )}
        {!isCancelled && r.attendance && <span className="print-only">{ATTENDANCE_OPTIONS.find((o) => o.value === r.attendance)?.label}</span>}
      </td>
      <td className="no-print">
        {!isCancelled && (
          <div className="actions">
            <button type="button" onClick={() => onEdit(r)}>Modifica</button>
            {r.hasNoShowFlag && <button type="button" onClick={() => onToggleFlag(r, false)}>Rimuovi flag</button>}
            {isConfirmingCancel ? (
              <>
                <button type="button" className="danger" onClick={() => { setIsConfirmingCancel(false); onCancel(r); }}>Conferma annullo</button>
                <button type="button" onClick={() => setIsConfirmingCancel(false)}>No</button>
              </>
            ) : <button type="button" className="danger" onClick={() => setIsConfirmingCancel(true)}>Annulla</button>}
          </div>
        )}
      </td>

      <style jsx>{`
        td { padding: var(--s-3) var(--s-4); border-top: 1px solid var(--color-line); vertical-align: top; color: var(--color-paper); font-size: 0.9rem; }
        tr.cancelled td { opacity: 0.5; text-decoration: line-through; }
        tr.cancelled td .badge { text-decoration: none; }
        .num { font-family: var(--font-mono); text-align: center; }
        small { color: var(--color-text-dim); }
        .notes { font-style: italic; }
        .phone { color: var(--color-brass-bright); text-decoration: none; font-family: var(--font-mono); font-size: 0.85rem; }
        .flag, .warn {
          display: inline-block; margin-left: var(--s-2); padding: 0.1rem 0.5rem; border-radius: var(--r-sm);
          font-size: 0.72rem; font-weight: 600; background: rgba(217, 138, 125, 0.15); color: var(--color-danger);
          border: 1px solid rgba(217, 138, 125, 0.4);
        }
        .warn { background: rgba(207, 169, 89, 0.15); color: var(--color-warning); border-color: rgba(207, 169, 89, 0.4); }
        .badge { color: var(--color-text-dim); font-size: 0.8rem; }
        .attendance, .actions { display: flex; gap: var(--s-2); flex-wrap: wrap; }
        button {
          min-height: 44px; padding: 0 var(--s-3); background: transparent; color: var(--color-text-soft);
          border: 1px solid var(--color-line-strong); border-radius: var(--r-sm); font-size: 0.8125rem; cursor: pointer;
        }
        button:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        button.on.arrived { background: rgba(123, 174, 143, 0.2); color: var(--color-success); border-color: var(--color-success); }
        button.on.late { background: rgba(207, 169, 89, 0.2); color: var(--color-warning); border-color: var(--color-warning); }
        button.on.no_show { background: rgba(217, 138, 125, 0.2); color: var(--color-danger); border-color: var(--color-danger); }
        button.danger { color: var(--color-danger); border-color: rgba(217, 138, 125, 0.5); }
        .print-only { display: none; }
        @media print { .print-only { display: inline; } td { color: #000; border-color: #999; } .phone, small { color: #000; } }
      `}</style>
    </tr>
  );
}
