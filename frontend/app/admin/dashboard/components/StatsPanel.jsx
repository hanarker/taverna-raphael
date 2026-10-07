'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '../../adminApi';
import { todayRome, addDaysISO, formatDateLabel } from '../../../utils/dates';

const DEFAULT_RANGE_DAYS = 28;

export default function StatsPanel() {
  const [range, setRange] = useState(() => ({ from: addDaysISO(todayRome(), -DEFAULT_RANGE_DAYS), to: todayRome() }));
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    adminFetch(`/stats?from=${range.from}&to=${range.to}`).then((result) => {
      if (!isCurrent) return;
      setError(result.ok ? '' : (result.data.error ?? 'Errore nel caricamento.'));
      if (result.ok) setStats(result.data);
    });
    return () => { isCurrent = false; };
  }, [range]);

  const maxCovers = Math.max(1, ...(stats?.weeklyCovers.map((w) => w.covers) ?? [1]));

  return (
    <div>
      <div className="range">
        <label>Dal <input type="date" value={range.from} max={range.to} onChange={(e) => e.target.value && setRange({ ...range, from: e.target.value })} /></label>
        <label>Al <input type="date" value={range.to} min={range.from} onChange={(e) => e.target.value && setRange({ ...range, to: e.target.value })} /></label>
      </div>
      <p className="hint">Include le prenotazioni recenti e i dati aggregati anonimi dei mesi precedenti (i dati personali si cancellano dopo 30 giorni).</p>
      {error && <p className="err" role="alert">{error}</p>}

      {stats && (
        <>
          <div className="cards">
            <div className="card"><span className="k">Tasso di no-show</span><span className="v">{stats.noShowRate.toFixed(1)}%</span>
              <span className="s">{stats.noShows} su {stats.totalReservations} prenotazioni</span></div>
            <div className="card"><span className="k">Turno più richiesto</span>
              <span className="v">{stats.topShift ? `${stats.topShift.shiftName} · ${stats.topShift.startTime}` : '—'}</span>
              <span className="s">{stats.topShift ? `${stats.topShift.covers} coperti nel periodo` : 'Nessun dato'}</span></div>
          </div>

          <h3>Coperti per settimana</h3>
          {stats.weeklyCovers.length === 0 && <p className="hint">Nessun dato nel periodo.</p>}
          {stats.weeklyCovers.map((w) => (
            <div key={w.weekStart} className="bar-row">
              <span className="bar-label">Sett. dal {formatDateLabel(w.weekStart)}</span>
              <div className="bar-track"><div className="bar" style={{ width: `${(w.covers / maxCovers) * 100}%` }} /></div>
              <span className="bar-value">{w.covers}</span>
            </div>
          ))}
        </>
      )}

      <style jsx>{`
        .range { display: flex; gap: var(--s-4); flex-wrap: wrap; margin-bottom: var(--s-2); }
        label { color: var(--color-text-soft); font-size: 0.85rem; display: flex; gap: var(--s-2); align-items: center; }
        input { min-height: 44px; background: var(--color-ink); color: var(--color-paper); border: 1px solid var(--color-line-strong); border-radius: var(--r-sm); padding: 0 var(--s-3); color-scheme: dark; }
        input:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        .hint { color: var(--color-text-dim); font-size: 0.8125rem; margin: 0 0 var(--s-6); }
        .err { color: var(--color-danger); }
        .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--s-4); margin-bottom: var(--s-8); }
        .card { background: var(--color-ink); border: 1px solid var(--color-line); border-radius: var(--r-md); padding: var(--s-6); display: flex; flex-direction: column; gap: var(--s-2); }
        .k { font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-dim); }
        .v { font-family: var(--font-display); font-style: italic; font-size: 1.8rem; color: var(--color-paper); }
        .s { color: var(--color-text-soft); font-size: 0.8125rem; }
        h3 { font-size: 1.1rem; font-weight: 500; color: var(--color-paper); margin: 0 0 var(--s-4); }
        .bar-row { display: grid; grid-template-columns: minmax(8rem, 14rem) 1fr 3rem; gap: var(--s-3); align-items: center; margin-bottom: var(--s-2); }
        .bar-label { color: var(--color-text-soft); font-size: 0.8125rem; }
        .bar-track { background: var(--color-ink); border-radius: var(--r-sm); height: 14px; overflow: hidden; }
        .bar { background: var(--color-brass); height: 100%; }
        .bar-value { font-family: var(--font-mono); color: var(--color-paper); text-align: right; }
        @media (max-width: 600px) { .bar-row { grid-template-columns: 1fr 3rem; } .bar-track { grid-column: 1 / -1; grid-row: 2; } }
      `}</style>
    </div>
  );
}
