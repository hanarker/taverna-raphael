'use client';

import { useState, useEffect } from 'react';

const SHIFT_INFO = {
    lunch:   { label: 'Pranzo', time: '13:00 – 15:00' },
    dinner1: { label: 'Cena',   time: '19:30 – 21:30' },
    dinner2: { label: 'Cena',   time: '21:30 – 23:30' },
};

export default function ReservationForm() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        date: '', turn: '', guests: '', notes: '',
    });
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [availability, setAvailability] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!formData.date) { setAvailability(null); return; }
        setAvailabilityLoading(true);
        fetch(`${API_URL}/api/reservations/availability?date=${formData.date}`)
            .then(r => r.json())
            .then(data => { setAvailability(data); setAvailabilityLoading(false); })
            .catch(() => setAvailabilityLoading(false));
    }, [formData.date]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch(`${API_URL}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                if (res.status === 409) {
                    const data = await res.json();
                    setErrorMessage(`Turno al completo. Posti disponibili: ${data.available}`);
                } else {
                    setErrorMessage(!navigator.onLine
                        ? 'Nessuna connessione internet. Controlla la rete e riprova.'
                        : 'Impossibile completare la prenotazione. Riprova tra qualche minuto o chiamaci direttamente.');
                }
                setStatus('error');
                return;
            }
            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', phone: '', date: '', turn: '', guests: '', notes: '' });
            setAvailability(null);
        } catch (error) {
            console.error(error);
            setErrorMessage('Impossibile completare la prenotazione. Riprova tra qualche minuto o chiamaci direttamente.');
            setStatus('error');
        }
    };

    const selectedAvail = formData.turn && availability?.shifts?.[formData.turn];
    const showWarning = selectedAvail &&
        selectedAvail.available > 0 &&
        Number(formData.guests) > selectedAvail.available;

    return (
        <div className="form-container">
            {status === 'success' ? (
                <div className="success-state" role="status" aria-live="polite">
                    <div className="success-icon" aria-hidden="true">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M14 24l7 7 13-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h3>Prenotazione inviata</h3>
                    <p>La tua richiesta è stata ricevuta. Ti contatteremo per conferma. A presto alla Taverna Raphael.</p>
                    <button className="btn" onClick={() => setStatus('idle')}>Nuova Prenotazione</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="reservation-form" noValidate>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">Nome <span aria-hidden="true">*</span></label>
                            <input id="firstName" type="text" name="firstName" autoComplete="given-name" value={formData.firstName} onChange={handleChange} required placeholder="Mario" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Cognome <span aria-hidden="true">*</span></label>
                            <input id="lastName" type="text" name="lastName" autoComplete="family-name" value={formData.lastName} onChange={handleChange} required placeholder="Rossi" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
                            <input id="email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required placeholder="mario@email.it" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Telefono <span aria-hidden="true">*</span></label>
                            <input id="phone" type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} required placeholder="+39 081 1234567" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Data <span aria-hidden="true">*</span></label>
                            <input id="date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="guests">Ospiti <span aria-hidden="true">*</span></label>
                            <input id="guests" type="number" name="guests" min="1" max="20" value={formData.guests} onChange={handleChange} required placeholder="2" />
                        </div>
                    </div>

                    <div className="form-group turn-group">
                        <fieldset className="turn-fieldset">
                            <legend>Turno <span aria-hidden="true">*</span></legend>
                            {availabilityLoading && <p className="avail-loading">Controllo disponibilità…</p>}
                            <div className="turn-options">
                                {Object.entries(SHIFT_INFO).map(([key, info]) => {
                                    const avail = availability?.shifts?.[key];
                                    const isFull = avail?.available === 0;
                                    return (
                                        <label key={key} className={`turn-option${isFull ? ' full' : ''}${formData.turn === key ? ' selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="turn"
                                                value={key}
                                                checked={formData.turn === key}
                                                onChange={handleChange}
                                                disabled={isFull}
                                                required
                                            />
                                            <span className="turn-label">{info.label}</span>
                                            <span className="turn-time">{info.time}</span>
                                            {isFull && <span className="turn-full-badge">Al completo</span>}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>
                        {showWarning && (
                            <p className="turn-warning" role="alert">
                                Solo {selectedAvail.available} {selectedAvail.available === 1 ? 'posto rimasto' : 'posti rimasti'} in questo turno
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Note Speciali</label>
                        <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Allergie, occasioni speciali, richieste particolari…"></textarea>
                    </div>

                    <button type="submit" className="btn btn-submit" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Invio in corso…' : 'Prenota Tavolo'}
                    </button>

                    <div role="alert" aria-live="assertive" aria-atomic="true">
                        {status === 'error' && <p className="error-text">{errorMessage}</p>}
                    </div>
                </form>
            )}

            <style jsx>{`
        .form-container {
          background: #FFFFFF;
          border: 1px solid var(--color-line);
          border-radius: var(--r-md);
          padding: var(--s-12);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--s-6);
          margin-bottom: var(--s-6);
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--s-2);
          margin-bottom: 0;
        }

        label {
          font-family: var(--font-body);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: var(--color-ink);
        }

        label span {
          color: var(--color-sabbia);
        }

        input, textarea {
          border: none;
          border-bottom: 1.5px solid var(--color-line-strong);
          background: transparent;
          padding: var(--s-3) 0;
          color: var(--color-ink);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: border-color var(--dur-fast) var(--ease);
          border-radius: 0;
          color-scheme: light;
          -webkit-appearance: none;
        }

        input::placeholder, textarea::placeholder {
          color: var(--color-muted);
          font-style: italic;
          opacity: 0.7;
        }

        input:focus, textarea:focus {
          border-bottom: 2px solid var(--color-sabbia);
          outline: none;
        }

        input::-webkit-calendar-picker-indicator {
          opacity: 0.5;
          cursor: pointer;
        }

        input::-webkit-calendar-picker-indicator:hover {
          opacity: 0.8;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
          border-bottom: 1.5px solid var(--color-line-strong);
        }

        textarea:focus {
          border-bottom: 2px solid var(--color-sabbia);
        }

        /* Turn selector */
        .turn-group {
          margin-bottom: var(--s-6);
        }

        .turn-fieldset {
          border: none;
          padding: 0;
          margin: 0;
        }

        .turn-fieldset legend {
          font-family: var(--font-body);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: var(--color-ink);
          margin-bottom: var(--s-3);
          float: left;
          width: 100%;
        }

        .turn-fieldset legend span {
          color: var(--color-sabbia);
        }

        .avail-loading {
          font-size: 0.8125rem;
          color: var(--color-muted);
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

        @media (max-width: 600px) {
          .turn-options { grid-template-columns: 1fr; }
        }

        .turn-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--s-1);
          padding: var(--s-4) var(--s-3);
          border: 1.5px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          cursor: pointer;
          transition: border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
          position: relative;
          text-align: center;
        }

        .turn-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          border: none;
        }

        .turn-option:hover:not(.full) {
          border-color: var(--color-sabbia);
          background: rgba(223, 185, 136, 0.06);
        }

        .turn-option.selected {
          border-color: var(--color-sabbia);
          background: rgba(223, 185, 136, 0.10);
        }

        .turn-option.full {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .turn-label {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--color-ink);
        }

        .turn-time {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          color: var(--color-muted);
        }

        .turn-full-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-danger);
          background: rgba(194, 94, 94, 0.10);
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
          margin-top: var(--s-1);
        }

        .turn-option:focus-within {
          outline: 2px solid var(--color-sabbia);
          outline-offset: 2px;
        }

        .turn-warning {
          font-size: 0.8125rem;
          color: var(--color-warning);
          margin: var(--s-2) 0 0;
        }

        .btn-submit {
          width: 100%;
          margin-top: var(--s-6);
          padding: 1rem;
          font-size: 0.9375rem;
          justify-content: center;
          display: block;
          text-align: center;
        }

        .btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* Success state */
        .success-state {
          text-align: center;
          padding: var(--s-12) var(--s-8);
        }

        .success-icon {
          color: var(--color-sabbia);
          margin-bottom: var(--s-6);
          animation: fadeIn var(--dur-base) var(--ease) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .success-icon { animation: none; }
        }

        .success-state h3 {
          font-size: 1.5rem;
          color: var(--color-ink);
          margin-bottom: var(--s-3);
        }

        .success-state p {
          color: var(--color-muted);
          margin-bottom: var(--s-8);
          line-height: 1.65;
        }

        .error-text {
          color: var(--color-danger);
          text-align: center;
          margin-top: var(--s-4);
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}</style>
        </div>
    );
}
