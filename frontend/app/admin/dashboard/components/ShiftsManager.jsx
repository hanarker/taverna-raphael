'use client';

import { useCallback, useEffect, useState } from 'react';
import ShiftListEditor from './ShiftListEditor';
import { adminFetch } from '../../adminApi';
import { formatDateLabel } from '../../../utils/dates';

const WEEK = [
  { weekday: 1, label: 'Lunedì' }, { weekday: 2, label: 'Martedì' }, { weekday: 3, label: 'Mercoledì' },
  { weekday: 4, label: 'Giovedì' }, { weekday: 5, label: 'Venerdì' }, { weekday: 6, label: 'Sabato' }, { weekday: 0, label: 'Domenica' },
];

const toShifts = (rows) => rows.map(({ name, startTime }) => ({ name, startTime }));

export default function ShiftsManager() {
  const [schedule, setSchedule] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [feedback, setFeedback] = useState({});
  const [override, setOverride] = useState({ date: '', closed: false, shifts: [] });

  const load = useCallback(async () => {
    const result = await adminFetch('/schedule');
    if (!result.ok) return;
    setSchedule(result.data);
    setDrafts(Object.fromEntries(WEEK.map(({ weekday }) => [
      weekday, toShifts(result.data.templates.filter((t) => t.weekday === weekday)),
    ])));
  }, []);

  useEffect(() => { load(); }, [load]);

  const say = (key, text, isError = false) => setFeedback((prev) => ({ ...prev, [key]: { text, isError } }));

  const saveWeekday = async (weekday) => {
    const result = await adminFetch(`/schedule/weekly/${weekday}`, { method: 'PUT', body: { shifts: drafts[weekday] } });
    say(weekday, result.ok ? 'Salvato.' : result.data.error, !result.ok);
    if (result.ok) load();
  };

  const saveOverride = async () => {
    if (!override.date) { say('override', 'Scegli la data.', true); return; }
    const result = await adminFetch(`/schedule/override/${override.date}`, { method: 'PUT', body: { closed: override.closed, shifts: override.shifts } });
    say('override', result.ok ? 'Eccezione salvata.' : result.data.error, !result.ok);
    if (result.ok) { setOverride({ date: '', closed: false, shifts: [] }); load(); }
  };

  const removeOverride = async (date) => {
    const result = await adminFetch(`/schedule/override/${date}`, { method: 'DELETE' });
    say('override', result.ok ? 'Eccezione rimossa.' : result.data.error, !result.ok);
    load();
  };

  const groupedOverrides = Object.entries((schedule?.overrides ?? []).reduce((acc, o) => ({ ...acc, [o.date]: [...(acc[o.date] ?? []), o] }), {}));

  if (!schedule) return <p className="loading">Caricamento…</p>;

  return (
    <div>
      <h2>Turni settimanali</h2>
      <p className="hint">Ogni turno dura 1h30 e ha 40 coperti. I turni di uno stesso giorno non possono sovrapporsi. Un giorno senza turni è chiuso.</p>
      {WEEK.map(({ weekday, label }) => (
        <section key={weekday} className="day">
          <h3>{label}</h3>
          <ShiftListEditor idPrefix={`w${weekday}`} shifts={drafts[weekday] ?? []} onChange={(next) => setDrafts((prev) => ({ ...prev, [weekday]: next }))} />
          <div className="save-row">
            <button type="button" className="save" onClick={() => saveWeekday(weekday)}>Salva {label.toLowerCase()}</button>
            {feedback[weekday] && <span role="status" className={feedback[weekday].isError ? 'err' : 'ok'}>{feedback[weekday].text}</span>}
          </div>
        </section>
      ))}

      <h2>Eccezioni per data</h2>
      <p className="hint">Sostituiscono lo schema settimanale per quella sola data (es. chiusura straordinaria o orari speciali).</p>
      <section className="day">
        <input type="date" aria-label="Data eccezione" value={override.date} onChange={(e) => setOverride({ ...override, date: e.target.value })} />
        <label className="check"><input type="checkbox" checked={override.closed} onChange={(e) => setOverride({ ...override, closed: e.target.checked })} /> Giornata chiusa</label>
        {!override.closed && <ShiftListEditor idPrefix="ov" shifts={override.shifts} onChange={(shifts) => setOverride({ ...override, shifts })} />}
        <div className="save-row">
          <button type="button" className="save" onClick={saveOverride}>Salva eccezione</button>
          {feedback.override && <span role="status" className={feedback.override.isError ? 'err' : 'ok'}>{feedback.override.text}</span>}
        </div>
      </section>
      {groupedOverrides.map(([date, rows]) => (
        <div key={date} className="ov-row">
          <span>{formatDateLabel(date)}: {rows[0].isClosed ? 'chiuso' : rows.map((r) => `${r.name} ${r.startTime}`).join(', ')}</span>
          <button type="button" onClick={() => removeOverride(date)}>Rimuovi</button>
        </div>
      ))}

      <style jsx>{`
        h2 { font-size: 1.25rem; font-weight: 500; color: var(--color-paper); margin: var(--s-8) 0 var(--s-2); }
        h2:first-child { margin-top: 0; }
        h3 { font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-brass-bright); margin: 0 0 var(--s-3); }
        .hint, .loading { color: var(--color-text-dim); font-size: 0.875rem; margin: 0 0 var(--s-4); }
        .day { background: var(--color-ink); border: 1px solid var(--color-line); border-radius: var(--r-md); padding: var(--s-4); margin-bottom: var(--s-3); }
        .save-row { display: flex; gap: var(--s-4); align-items: center; margin-top: var(--s-3); flex-wrap: wrap; }
        button, input[type="date"] {
          min-height: 44px; padding: 0 var(--s-4); background: transparent; color: var(--color-text-soft); border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm); font-family: var(--font-body); font-size: 0.875rem; cursor: pointer; color-scheme: dark;
        }
        button.save { background: var(--color-brass); color: var(--color-ink); border-color: var(--color-brass); font-weight: 600; }
        button:focus-visible, input:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        .ok { color: var(--color-success); font-size: 0.875rem; }
        .err { color: var(--color-danger); font-size: 0.875rem; }
        .check { display: flex; align-items: center; gap: var(--s-2); margin: var(--s-3) 0; color: var(--color-paper); font-size: 0.9rem; }
        .ov-row { display: flex; justify-content: space-between; align-items: center; gap: var(--s-4); padding: var(--s-2) 0; color: var(--color-paper); font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
