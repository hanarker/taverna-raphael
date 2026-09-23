'use client';

import { useCallback, useEffect, useState } from 'react';
import ReservationRow from './ReservationRow';
import ReservationFormModal from './ReservationFormModal';
import BulkCancelModal from './BulkCancelModal';
import { adminFetch } from '../../adminApi';
import { todayRome, addDaysISO, formatDateLabel } from '../../../utils/dates';

const REFRESH_INTERVAL_MS = 30000;

// Regole di stampa: solo la vista giornaliera, senza navigazione né pulsanti.
const PRINT_CSS = `
  @media print {
    header, nav, footer, .no-print, .tabs, .dashboard-header, .cookie-banner { display: none !important; }
    body, .dashboard-container, .tab-content { background: #fff !important; color: #000 !important; border: none !important; padding: 0 !important; }
    .print-title { display: block !important; }
    .shift-block { break-inside: avoid; }
  }
`;

export default function ReservationsTab() {
  const [date, setDate] = useState(todayRome);
  const [day, setDay] = useState(null);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'bulk', reservation? }

  const load = useCallback(async () => {
    const result = await adminFetch(`/reservations?date=${date}`);
    if (result.ok) setDay(result.data);
    else setMessage(result.data.error ?? 'Impossibile caricare le prenotazioni.');
  }, [date]);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const run = async (path, options, successMessage) => {
    const result = await adminFetch(path, options);
    setMessage(result.ok ? successMessage : (result.data.error ?? 'Operazione non riuscita.'));
    await load();
  };

  const onAttendance = (r, attendance) => run(`/reservations/${r.id}/attendance`, { method: 'PATCH', body: { attendance } }, '');
  const onCancel = (r) => run(`/reservations/${r.id}/cancel`, { method: 'POST' }, 'Prenotazione annullata: i posti sono di nuovo disponibili e il cliente è stato avvisato.');
  const onToggleFlag = (r, flagged) => run('/noshow-flags', { method: 'PUT', body: { reservationId: r.id, flagged } }, 'Flag no-show rimosso.');

  const totalCovers = day?.shifts.reduce((sum, s) => sum + s.bookedCovers, 0) ?? 0;

  return (
    <div>
      <div className="toolbar no-print">
        <div className="nav">
          <button type="button" onClick={() => setDate(addDaysISO(date, -1))} aria-label="Giorno precedente">‹</button>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Data" />
          <button type="button" onClick={() => setDate(addDaysISO(date, 1))} aria-label="Giorno successivo">›</button>
          <button type="button" onClick={() => setDate(todayRome())}>Oggi</button>
        </div>
        <div className="nav">
          <button type="button" className="primary" onClick={() => setModal({ type: 'create' })}>+ Nuova prenotazione</button>
          <button type="button" onClick={() => window.print()}>Stampa</button>
          <button type="button" className="danger" onClick={() => setModal({ type: 'bulk' })} disabled={!day}>Annulla in blocco</button>
        </div>
      </div>

      <h2 className="print-title">Taverna Raphael — {formatDateLabel(date)}</h2>
      {message && <p className="msg no-print" role="status">{message}</p>}

      {!day && <p className="empty">Caricamento…</p>}
      {day && day.shifts.length === 0 && <p className="empty">Nessun turno in questa data (giorno di chiusura).</p>}
      {day && <p className="summary">{formatDateLabel(date)} · {totalCovers} coperti prenotati</p>}

      {day?.shifts.map((shift) => (
        <section key={shift.startTime} className="shift-block">
          <h3>{shift.name} · {shift.startTime} <span className={shift.bookedCovers >= shift.capacity ? 'full' : ''}>{shift.bookedCovers}/{shift.capacity}</span></h3>
          {shift.reservations.length === 0 ? <p className="empty">Nessuna prenotazione.</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Cliente</th><th>Coperti</th><th>Contatti</th><th>Presenza</th><th className="no-print">Azioni</th></tr></thead>
                <tbody>
                  {shift.reservations.map((r) => (
                    <ReservationRow key={r.id} reservation={r} onAttendance={onAttendance}
                      onEdit={(res) => setModal({ type: 'edit', reservation: { ...res, startTime: shift.startTime } })}
                      onCancel={onCancel} onToggleFlag={onToggleFlag} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      {modal?.type === 'create' && <ReservationFormModal date={date} onClose={() => setModal(null)} onSaved={() => { setModal(null); setMessage('Prenotazione inserita.'); load(); }} />}
      {modal?.type === 'edit' && <ReservationFormModal reservation={modal.reservation} date={date} onClose={() => setModal(null)} onSaved={() => { setModal(null); setMessage('Prenotazione aggiornata.'); load(); }} />}
      {modal?.type === 'bulk' && day && <BulkCancelModal day={day} onClose={() => setModal(null)} onDone={(r) => { setModal(null); setMessage(`${r.cancelled} prenotazioni annullate e clienti avvisati.`); load(); }} />}

      <style jsx global>{PRINT_CSS}</style>
      <style jsx>{`
        .toolbar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--s-4); margin-bottom: var(--s-6); }
        .nav { display: flex; gap: var(--s-2); flex-wrap: wrap; align-items: center; }
        button, input {
          min-height: 44px; padding: 0 var(--s-4); background: var(--color-ink); color: var(--color-paper);
          border: 1px solid var(--color-line-strong); border-radius: var(--r-sm); font-family: var(--font-body); font-size: 0.875rem; cursor: pointer; color-scheme: dark;
        }
        button:focus-visible, input:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        button.primary { background: var(--color-brass); color: var(--color-ink); border-color: var(--color-brass); font-weight: 600; }
        button.danger { color: var(--color-danger); border-color: rgba(217, 138, 125, 0.5); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .print-title { display: none; font-size: 1.4rem; margin: 0 0 var(--s-4); }
        .msg { color: var(--color-brass-bright); font-size: 0.9rem; margin-bottom: var(--s-4); }
        .summary { color: var(--color-text-soft); font-family: var(--font-mono); font-size: 0.85rem; margin-bottom: var(--s-6); text-transform: capitalize; }
        .empty { color: var(--color-text-dim); padding: var(--s-4) 0; }
        .shift-block { margin-bottom: var(--s-8); }
        h3 { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 1.3rem; color: var(--color-paper); margin: 0 0 var(--s-3); }
        h3 span { font-family: var(--font-mono); font-size: 0.85rem; color: var(--color-brass-bright); margin-left: var(--s-3); }
        h3 span.full { color: var(--color-danger); }
        .table-wrap { overflow-x: auto; border: 1px solid var(--color-line); border-radius: var(--r-md); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: var(--s-3) var(--s-4); font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-dim); }
        @media print { h3, h3 span, th, .summary, .empty { color: #000; } }
      `}</style>
    </div>
  );
}
