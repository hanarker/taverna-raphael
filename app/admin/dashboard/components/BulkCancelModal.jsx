'use client';

import { useState } from 'react';
import AdminModal from './AdminModal';
import { ADMIN_FORM_CSS } from './formStyles';
import { adminFetch } from '../../adminApi';

const MAX_MESSAGE_LENGTH = 500;

/**
 * Annullamento in blocco di un turno o di un'intera giornata, con messaggio libero per i clienti.
 * @param {{ day: object, onClose: () => void, onDone: (result: { cancelled: number }) => void }} props
 */
export default function BulkCancelModal({ day, onClose, onDone }) {
  const [scope, setScope] = useState('day');
  const [message, setMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeIn = (shift) => shift.reservations.filter((r) => r.status === 'confirmed').length;
  const affected = scope === 'day'
    ? day.shifts.reduce((sum, s) => sum + activeIn(s), 0)
    : activeIn(day.shifts.find((s) => s.startTime === scope));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) { setError('Scrivi il messaggio che riceveranno i clienti.'); return; }
    setIsSending(true);
    const result = await adminFetch('/reservations/bulk-cancel', {
      method: 'POST', body: { date: day.date, startTime: scope === 'day' ? undefined : scope, message },
    });
    setIsSending(false);
    if (!result.ok) { setError(result.data.error ?? 'Errore durante l\'annullamento.'); return; }
    onDone(result.data);
  };

  return (
    <AdminModal title="Annulla prenotazioni in blocco" onClose={onClose}>
      <form className="admin-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="b-scope">Cosa annullare</label>
          <select id="b-scope" value={scope} onChange={(e) => { setScope(e.target.value); setIsConfirmed(false); }}>
            <option value="day">Tutta la giornata</option>
            {day.shifts.map((s) => <option key={s.startTime} value={s.startTime}>Solo {s.name} ({s.startTime})</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="b-message">Messaggio per i clienti (es. il motivo)</label>
          <textarea id="b-message" rows="3" maxLength={MAX_MESSAGE_LENGTH} value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Es. Purtroppo siamo costretti a chiudere per un guasto." required />
          <span className="hint">{message.length}/{MAX_MESSAGE_LENGTH} · verrà inviato su WhatsApp a tutti i clienti coinvolti.</span>
        </div>
        <div className="field">
          <label className="check"><input type="checkbox" checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)} />
            {' '}Confermo: annullare {affected} {affected === 1 ? 'prenotazione' : 'prenotazioni'} e avvisare i clienti</label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSending}>Indietro</button>
          <button type="submit" className="btn-danger" disabled={isSending || !isConfirmed || affected === 0}>
            {isSending ? 'Invio…' : 'Annulla e avvisa'}
          </button>
        </div>
      </form>
      <style>{ADMIN_FORM_CSS}</style>
    </AdminModal>
  );
}
