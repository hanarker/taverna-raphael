'use client';

import { useEffect, useState } from 'react';
import AdminModal from './AdminModal';
import { ADMIN_FORM_CSS } from './formStyles';
import { adminFetch, publicAvailabilityUrl } from '../../adminApi';

const DEFAULT_PHONE = '+39 ';

function initialState(reservation, date) {
  return reservation
    ? {
      firstName: reservation.firstName, lastName: reservation.lastName, email: reservation.email,
      phone: reservation.phone, guests: reservation.guests, notes: reservation.notes ?? '', date, startTime: reservation.startTime,
    }
    : { firstName: '', lastName: '', email: '', phone: DEFAULT_PHONE, guests: 2, notes: '', date, startTime: '' };
}

/**
 * Inserimento manuale (anche gruppi > 8) o modifica di una prenotazione.
 * @param {{ reservation?: object, date: string, onClose: () => void, onSaved: () => void }} props
 */
export default function ReservationFormModal({ reservation, date, onClose, onSaved }) {
  const isEdit = Boolean(reservation);
  const [form, setForm] = useState(() => initialState(reservation, date));
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    fetch(publicAvailabilityUrl(form.date), { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (isCurrent) setShifts(data.shifts ?? []); })
      .catch(() => { if (isCurrent) setShifts([]); });
    return () => { isCurrent = false; };
  }, [form.date]);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.startTime) { setError('Seleziona un turno.'); return; }
    setIsSaving(true);
    const payload = { ...form, guests: Number(form.guests) };
    const result = await adminFetch(isEdit ? `/reservations/${reservation.id}` : '/reservations', {
      method: isEdit ? 'PUT' : 'POST', body: payload,
    });
    setIsSaving(false);
    if (!result.ok) { setError(result.data.error ?? 'Errore durante il salvataggio.'); return; }
    onSaved();
  };

  return (
    <AdminModal title={isEdit ? 'Modifica prenotazione' : 'Nuova prenotazione'} onClose={onClose}>
      <form className="admin-form" onSubmit={save} noValidate>
        <div className="row">
          <div className="field"><label htmlFor="m-first">Nome</label>
            <input id="m-first" value={form.firstName} onChange={(e) => update({ firstName: e.target.value })} required /></div>
          <div className="field"><label htmlFor="m-last">Cognome</label>
            <input id="m-last" value={form.lastName} onChange={(e) => update({ lastName: e.target.value })} required /></div>
        </div>
        <div className="row">
          <div className="field"><label htmlFor="m-email">Email</label>
            <input id="m-email" type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} required /></div>
          <div className="field"><label htmlFor="m-phone">Telefono (con prefisso)</label>
            <input id="m-phone" type="tel" value={form.phone} onChange={(e) => update({ phone: e.target.value })} required /></div>
        </div>
        <div className="row">
          <div className="field"><label htmlFor="m-date">Data</label>
            <input id="m-date" type="date" value={form.date} onChange={(e) => update({ date: e.target.value, startTime: '' })} required /></div>
          <div className="field"><label htmlFor="m-guests">Coperti</label>
            <input id="m-guests" type="number" min="1" max="40" value={form.guests} onChange={(e) => update({ guests: e.target.value })} required /></div>
        </div>
        <div className="field">
          <label htmlFor="m-shift">Turno</label>
          <select id="m-shift" value={form.startTime} onChange={(e) => update({ startTime: e.target.value })} required>
            <option value="">Seleziona…</option>
            {shifts.map((s) => <option key={s.startTime} value={s.startTime}>{s.name} · {s.startTime} ({s.available} posti liberi)</option>)}
          </select>
          {shifts.length === 0 && <span className="hint">Nessun turno configurato per questa data.</span>}
        </div>
        <div className="field"><label htmlFor="m-notes">Note</label>
          <textarea id="m-notes" rows="2" value={form.notes} onChange={(e) => update({ notes: e.target.value })} /></div>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>Annulla</button>
          <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? 'Salvataggio…' : 'Salva'}</button>
        </div>
      </form>
      <style>{ADMIN_FORM_CSS}</style>
    </AdminModal>
  );
}
