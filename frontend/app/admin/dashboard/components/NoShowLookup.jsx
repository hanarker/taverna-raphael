'use client';

import { useState } from 'react';
import { adminFetch } from '../../adminApi';

// Il flag è salvato come HMAC del numero: si gestisce cercando il numero, non sfogliando un elenco.
export default function NoShowLookup() {
  const [phone, setPhone] = useState('+39 ');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const check = async () => {
    setError('');
    const response = await adminFetch(`/noshow-flags?phone=${encodeURIComponent(phone)}`);
    if (!response.ok) { setResult(null); setError(response.data.error); return; }
    setResult(response.data);
  };

  const setFlag = async (flagged) => {
    const response = await adminFetch('/noshow-flags', { method: 'PUT', body: { phone, flagged } });
    if (!response.ok) { setError(response.data.error); return; }
    setResult({ phone: result.phone, flagged });
  };

  return (
    <section>
      <h2>Flag no-show per numero</h2>
      <p className="hint">Un numero segnato come no-show mostra un alert su ogni sua futura prenotazione (non la blocca). Si può rimuovere in qualsiasi momento.</p>
      <div className="line">
        <input aria-label="Numero di telefono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="button" onClick={check}>Verifica</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {result && (
        <p role="status" className="result">
          {result.phone}: {result.flagged ? 'flag no-show ATTIVO' : 'nessun flag'}{' '}
          <button type="button" onClick={() => setFlag(!result.flagged)}>{result.flagged ? 'Rimuovi flag' : 'Attiva flag'}</button>
        </p>
      )}

      <style jsx>{`
        h2 { font-size: 1.25rem; font-weight: 500; color: var(--color-paper); margin: var(--s-8) 0 var(--s-2); }
        .hint { color: var(--color-text-dim); font-size: 0.8125rem; }
        .line { display: flex; gap: var(--s-2); flex-wrap: wrap; }
        input, button { min-height: 44px; background: var(--color-ink); color: var(--color-paper); border: 1px solid var(--color-line-strong); border-radius: var(--r-sm); padding: 0 var(--s-4); font-size: 0.9rem; }
        button { cursor: pointer; color: var(--color-text-soft); }
        input:focus-visible, button:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        .error { color: var(--color-danger); }
        .result { color: var(--color-paper); margin-top: var(--s-4); }
      `}</style>
    </section>
  );
}
