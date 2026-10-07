'use client';

import { useEffect, useState } from 'react';
import NoShowLookup from './NoShowLookup';
import { ADMIN_FORM_CSS } from './formStyles';
import { adminFetch } from '../../adminApi';

const TEMPLATE_EVENTS = [
  { key: 'confirmation', label: 'Conferma prenotazione' },
  { key: 'reminder_24h', label: 'Reminder 24 ore prima' },
  { key: 'reminder_morning', label: 'Reminder ore 09:00 del giorno' },
  { key: 'cancellation', label: 'Cancellazione singola' },
  { key: 'bulk_cancellation', label: 'Annullamento in blocco' },
  { key: 'owner_new_reservation', label: 'Avviso al titolare (nuova prenotazione)' },
];
const VARIABLES_HELP = 'name, date, time, guests, shiftName, contact, message, waLink';

const parseVariables = (text) => text.split(',').map((v) => v.trim()).filter(Boolean);

export default function SettingsManager() {
  const [form, setForm] = useState(null);
  const [templates, setTemplates] = useState({});
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    adminFetch('/settings').then((result) => {
      if (!result.ok) return;
      const s = result.data;
      setForm({
        cutoffMinutes: s.cutoffMinutes, insufficientSeatsMessage: s.insufficientSeatsMessage,
        cancellationContactText: s.cancellationContactText, ownerWhatsapp: s.ownerWhatsapp,
        restaurantPhone: s.restaurantPhone, incomingReplyText: s.incomingReplyText,
      });
      setTemplates(Object.fromEntries(TEMPLATE_EVENTS.map(({ key }) => [key, {
        contentSid: s.whatsappTemplates?.[key]?.contentSid ?? '',
        variables: (s.whatsappTemplates?.[key]?.variables ?? []).join(', '),
      }])));
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const whatsappTemplates = Object.fromEntries(Object.entries(templates)
      .filter(([, t]) => t.contentSid.trim())
      .map(([key, t]) => [key, { contentSid: t.contentSid.trim(), variables: parseVariables(t.variables) }]));
    const result = await adminFetch('/settings', { method: 'PUT', body: { ...form, cutoffMinutes: Number(form.cutoffMinutes), whatsappTemplates } });
    setFeedback({ text: result.ok ? 'Impostazioni salvate.' : result.data.error, isError: !result.ok });
  };

  if (!form) return <p>Caricamento…</p>;
  const setField = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const setTemplate = (key, patch) => setTemplates((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  return (
    <div className="admin-form">
      <form onSubmit={save} noValidate>
        <h2>Prenotazioni online</h2>
        <div className="field">
          <label htmlFor="s-cutoff">Chiudi le prenotazioni online X minuti prima del turno</label>
          <input id="s-cutoff" type="number" min="0" max="10080" value={form.cutoffMinutes} onChange={(e) => setField({ cutoffMinutes: e.target.value })} />
          <span className="hint">Valore provvisorio (2 ore = 120) in attesa di conferma dal cliente.</span>
        </div>
        <div className="field">
          <label htmlFor="s-seats">Messaggio quando i posti sono insufficienti</label>
          <textarea id="s-seats" rows="2" value={form.insufficientSeatsMessage} onChange={(e) => setField({ insufficientSeatsMessage: e.target.value })} />
        </div>

        <h2>Messaggi WhatsApp</h2>
        <div className="field">
          <label htmlFor="s-phone">Telefono del ristorante</label>
          <input id="s-phone" type="tel" value={form.restaurantPhone} onChange={(e) => setField({ restaurantPhone: e.target.value })} placeholder="+39 366 357 5967" />
          <span className="hint">Compare nella ricevuta scaricabile dal cliente.</span>
        </div>
        <div className="field">
          <label htmlFor="s-contact">Indicazioni per la disdetta (nei reminder, variabile «contact»)</label>
          <textarea id="s-contact" rows="2" value={form.cancellationContactText} onChange={(e) => setField({ cancellationContactText: e.target.value })}
            placeholder={`Per disdire chiama il ${form.restaurantPhone}`} />
        </div>
        <div className="field">
          <label htmlFor="s-owner">WhatsApp del titolare (con prefisso)</label>
          <input id="s-owner" type="tel" value={form.ownerWhatsapp} onChange={(e) => setField({ ownerWhatsapp: e.target.value })} placeholder="+39 366 357 5967" />
        </div>
        <div className="field">
          <label htmlFor="s-reply">Risposta automatica a chi scrive su WhatsApp</label>
          <textarea id="s-reply" rows="2" value={form.incomingReplyText} onChange={(e) => setField({ incomingReplyText: e.target.value })} />
          <span className="hint">Ricevuta da chiunque risponda ai messaggi del ristorante. Non può essere vuota.</span>
        </div>
        <p className="hint">I testi dei template si approvano su Meta/Twilio. Qui si collega ogni evento al Content SID approvato e si indica l&apos;ordine delle variabili ({VARIABLES_HELP}). Senza SID l&apos;evento non invia nulla.</p>
        {TEMPLATE_EVENTS.map(({ key, label }) => (
          <div key={key} className="row">
            <div className="field"><label htmlFor={`t-${key}`}>{label} · Content SID</label>
              <input id={`t-${key}`} value={templates[key]?.contentSid ?? ''} onChange={(e) => setTemplate(key, { contentSid: e.target.value })} placeholder="HX…" /></div>
            <div className="field"><label htmlFor={`v-${key}`}>Variabili in ordine</label>
              <input id={`v-${key}`} value={templates[key]?.variables ?? ''} onChange={(e) => setTemplate(key, { variables: e.target.value })} placeholder="name, date, time" /></div>
          </div>
        ))}

        {feedback && <p role="status" className={feedback.isError ? 'error' : 'hint'}>{feedback.text}</p>}
        <div className="actions"><button type="submit" className="btn-primary">Salva impostazioni</button></div>
      </form>

      <NoShowLookup />
      <style>{ADMIN_FORM_CSS}</style>
      <style jsx>{`
        h2 { font-size: 1.25rem; font-weight: 500; color: var(--color-paper); margin: var(--s-8) 0 var(--s-4); }
        h2:first-of-type { margin-top: 0; }
      `}</style>
    </div>
  );
}
