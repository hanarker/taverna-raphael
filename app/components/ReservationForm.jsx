'use client';

import { useState, useEffect } from 'react';
import { SHIFT_INFO } from '../data/shifts';
import ReservationTicket from './ReservationTicket';

const MIN_GUESTS = 1;
const MAX_GUESTS = 8;
const CLOSED_WEEKDAY = 1; // 1 = lunedì (Date.getDay())

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

export default function ReservationForm() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        date: '', turn: '', guests: 2, notes: '',
    });
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [availability, setAvailability] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [confirmedReservation, setConfirmedReservation] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

    const adjustGuests = (delta) => {
        setFormData((prev) => ({
            ...prev,
            guests: Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, Number(prev.guests) + delta)),
        }));
    };

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', email: '', phone: '', date: '', turn: '', guests: 2, notes: '' });
        setAvailability(null);
        setConfirmedReservation(null);
        setStatus('idle');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.turn) {
            setErrorMessage('Seleziona un turno per continuare.');
            setStatus('error');
            return;
        }

        const chosenDate = new Date(`${formData.date}T12:00:00`);
        if (chosenDate.getDay() === CLOSED_WEEKDAY) {
            setErrorMessage('Siamo chiusi il lunedì: scegli un altro giorno.');
            setStatus('error');
            return;
        }

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
                } else if (res.status === 400) {
                    const data = await res.json();
                    setErrorMessage(data.errors?.[0] ?? 'Dati non validi. Controlla il modulo e riprova.');
                } else {
                    setErrorMessage(!navigator.onLine
                        ? 'Nessuna connessione internet. Controlla la rete e riprova.'
                        : 'Impossibile completare la prenotazione. Riprova tra qualche minuto o chiamaci direttamente.');
                }
                setStatus('error');
                return;
            }
            const created = await res.json();
            setConfirmedReservation(created);
            setStatus('success');
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
            {status === 'success' && confirmedReservation ? (
                <ReservationTicket reservation={confirmedReservation} onReset={resetForm} />
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
                            <input id="date" type="date" name="date" min={todayISO()} value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="guestCount">Ospiti <span aria-hidden="true">*</span></label>
                            <div className="stepper" id="guestCount">
                                <button type="button" onClick={() => adjustGuests(-1)} aria-label="Diminuisci ospiti" disabled={formData.guests <= MIN_GUESTS}>−</button>
                                <span aria-live="polite">{formData.guests}</span>
                                <button type="button" onClick={() => adjustGuests(1)} aria-label="Aumenta ospiti" disabled={formData.guests >= MAX_GUESTS}>+</button>
                            </div>
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
          background: var(--color-ink);
          border: 1px solid var(--color-line-strong);
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
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-dim);
        }

        label span {
          color: var(--color-brass-bright);
        }

        input, textarea {
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          color: var(--color-paper);
          padding: var(--s-3);
          font-family: var(--font-body);
          font-size: 0.95rem;
          transition: border-color var(--dur-fast) var(--ease);
          color-scheme: dark;
        }

        input::placeholder, textarea::placeholder {
          color: var(--color-text-dim);
          font-style: italic;
          opacity: 0.8;
        }

        input:focus, textarea:focus {
          border-color: var(--color-brass-bright);
          outline: none;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Stepper ospiti */
        .stepper {
          display: flex;
          align-items: center;
          gap: var(--s-4);
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          padding: 0.4rem var(--s-4);
        }

        .stepper button {
          background: none;
          border: 1px solid var(--color-brass);
          color: var(--color-brass-bright);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-size: 1.1rem;
          cursor: pointer;
          line-height: 1;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
        }

        .stepper button:hover:not(:disabled) {
          background: var(--color-brass);
          color: var(--color-ink);
        }

        .stepper button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .stepper span {
          font-family: var(--font-mono);
          font-size: 1.05rem;
          flex: 1;
          text-align: center;
          color: var(--color-paper);
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
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-dim);
          margin-bottom: var(--s-3);
          float: left;
          width: 100%;
        }

        .turn-fieldset legend span {
          color: var(--color-brass-bright);
        }

        .avail-loading {
          font-size: 0.8125rem;
          color: var(--color-text-dim);
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
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
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
          border-color: var(--color-brass-bright);
        }

        .turn-option.selected {
          border-color: var(--color-brass-bright);
          background: rgba(201, 163, 95, 0.12);
        }

        .turn-option.full {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .turn-label {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--color-paper);
        }

        .turn-time {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--color-text-soft);
        }

        .turn-full-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-danger);
          background: rgba(217, 138, 125, 0.12);
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
          margin-top: var(--s-1);
        }

        .turn-option:focus-within {
          outline: 2px solid var(--color-brass-bright);
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
