'use client';

/**
 * Elenco modificabile di turni (nome + orario di inizio). Ogni turno dura 90 minuti: la validazione
 * anti-sovrapposizione è lato server, qui si mostra solo l'errore restituito.
 * @param {{ shifts: Array<{name: string, startTime: string}>, onChange: (next: Array) => void, idPrefix: string }} props
 */
export default function ShiftListEditor({ shifts, onChange, idPrefix }) {
  const update = (index, patch) => onChange(shifts.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const remove = (index) => onChange(shifts.filter((_, i) => i !== index));
  const add = () => onChange([...shifts, { name: '', startTime: '' }]);

  return (
    <div>
      {shifts.length === 0 && <p className="hint">Nessun turno: giornata chiusa.</p>}
      {shifts.map((shift, index) => (
        <div key={index} className="line">
          <input aria-label={`Nome turno ${index + 1}`} id={`${idPrefix}-n-${index}`} value={shift.name} placeholder="Es. Cena 1"
            onChange={(e) => update(index, { name: e.target.value })} />
          <input aria-label={`Orario turno ${index + 1}`} id={`${idPrefix}-t-${index}`} type="time" value={shift.startTime}
            onChange={(e) => update(index, { startTime: e.target.value })} />
          <button type="button" onClick={() => remove(index)} aria-label={`Rimuovi turno ${index + 1}`}>✕</button>
        </div>
      ))}
      <button type="button" className="add" onClick={add}>+ Aggiungi turno</button>

      <style jsx>{`
        .line { display: grid; grid-template-columns: 1fr 8rem 44px; gap: var(--s-2); margin-bottom: var(--s-2); }
        input, button {
          min-height: 44px; background: var(--color-ink); color: var(--color-paper); border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm); padding: 0 var(--s-3); font-family: var(--font-body); font-size: 0.9rem; color-scheme: dark; min-width: 0;
        }
        button { cursor: pointer; color: var(--color-text-soft); }
        button.add { color: var(--color-brass-bright); margin-top: var(--s-2); }
        input:focus-visible, button:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        .hint { color: var(--color-text-dim); font-size: 0.85rem; margin: 0 0 var(--s-2); }
      `}</style>
    </div>
  );
}
