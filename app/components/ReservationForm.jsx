'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReservationTicket from './ReservationTicket';
import ShiftPicker from './reservation/ShiftPicker';
import PhoneField, { DEFAULT_DIAL_CODE } from './reservation/PhoneField';
import useAvailability from '../hooks/useAvailability';
import { createReservation } from '../services/reservationsApi';
import { todayRome, addDaysISO } from '../utils/dates';

const MIN_GUESTS = 1;
const MAX_GUESTS = 8;
const BOOKING_WINDOW_DAYS = 30;
const ITALIAN_DIAL_CODE = '+39';
const GENERIC_ERROR = 'Impossibile completare la prenotazione. Riprova tra qualche minuto o chiamaci direttamente.';

const EMPTY_FORM = {
    firstName: '', lastName: '', email: '', dialCode: DEFAULT_DIAL_CODE, phoneNumber: '',
    date: '', startTime: '', guests: 2, notes: '', consent: false,
};

// I numeri esteri non usano lo zero iniziale nazionale (prefisso di linea): in Italia invece fa parte del numero.
function buildPhone({ dialCode, phoneNumber }) {
    const digits = phoneNumber.replace(/[^\d]/g, '');
    const national = dialCode === ITALIAN_DIAL_CODE ? digits : digits.replace(/^0+/, '');
    return `${dialCode}${national}`;
}

export default function ReservationForm() {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmedReservation, setConfirmedReservation] = useState(null);
    const { availability, isLoading, hasError } = useAvailability(formData.date);

    const today = todayRome();
    const lastBookableDay = addDaysISO(today, BOOKING_WINDOW_DAYS);

    const updateField = (patch) => setFormData((prev) => ({ ...prev, ...patch }));
    const handleChange = (e) => updateField({ [e.target.name]: e.target.value });
    const handleDateChange = (e) => updateField({ date: e.target.value, startTime: '' });
    const adjustGuests = (delta) => updateField({
        guests: Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, Number(formData.guests) + delta)),
    });

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setConfirmedReservation(null);
        setErrorMessage('');
        setStatus('idle');
    };

    const selectedShift = availability?.shifts?.find((s) => s.startTime === formData.startTime);
    const isSelectionStale = Boolean(formData.startTime) && availability && !selectedShift;
    const hasTooFewSeats = Boolean(selectedShift) && selectedShift.bookable && Number(formData.guests) > selectedShift.available;
    const seatsMessage = availability?.insufficientSeatsMessage
        ?? 'Posti insufficienti per questo turno, prova un altro orario o riduci il numero di persone.';

    const fail = (message) => {
        setErrorMessage(message);
        setStatus('error');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.startTime) return fail('Seleziona un turno per continuare.');
        if (isSelectionStale || (selectedShift && !selectedShift.bookable)) return fail('Il turno selezionato non è più disponibile: scegline un altro.');
        if (hasTooFewSeats) return fail(seatsMessage);
        if (!formData.consent) return fail('Per prenotare è necessario acconsentire al trattamento dei dati.');

        setStatus('loading');
        try {
            const { ok, data } = await createReservation({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: buildPhone(formData),
                date: formData.date,
                startTime: formData.startTime,
                guests: Number(formData.guests),
                notes: formData.notes,
                consent: formData.consent,
            });
            if (!ok) return fail(data.error ?? (navigator.onLine ? GENERIC_ERROR : 'Nessuna connessione internet. Controlla la rete e riprova.'));

            setConfirmedReservation(data);
            setStatus('success');
        } catch (error) {
            console.error(error);
            fail(GENERIC_ERROR);
        }
    };

    if (status === 'success' && confirmedReservation) {
        return (
            <div className="form-container">
                <ReservationTicket reservation={confirmedReservation} onReset={resetForm} />
                <style jsx>{`
                    .form-container { background: var(--color-ink); border: 1px solid var(--color-line-strong); border-radius: var(--r-md); padding: var(--s-8); }
                    @media (max-width: 600px) { .form-container { padding: var(--s-6); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="reservation-form" noValidate>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">Nome <span aria-hidden="true">*</span></label>
                        <input id="firstName" type="text" name="firstName" autoComplete="given-name" maxLength={80} value={formData.firstName} onChange={handleChange} required placeholder="Mario" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Cognome <span aria-hidden="true">*</span></label>
                        <input id="lastName" type="text" name="lastName" autoComplete="family-name" maxLength={80} value={formData.lastName} onChange={handleChange} required placeholder="Rossi" />
                    </div>
                </div>

                <div className="form-group field-full">
                    <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
                    <input id="email" type="email" name="email" autoComplete="email" maxLength={160} value={formData.email} onChange={handleChange} required placeholder="mario@email.it" />
                </div>

                <div className="form-group field-full">
                    <label htmlFor="phone">Telefono <span aria-hidden="true">*</span></label>
                    <PhoneField dialCode={formData.dialCode} number={formData.phoneNumber} onChange={updateField} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date">Data <span aria-hidden="true">*</span></label>
                        <input id="date" type="date" name="date" min={today} max={lastBookableDay} value={formData.date} onChange={handleDateChange} required />
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
                    <ShiftPicker
                        shifts={availability?.shifts ?? null}
                        selected={formData.startTime}
                        onSelect={(startTime) => updateField({ startTime })}
                        isLoading={isLoading}
                        hasDate={Boolean(formData.date)}
                    />
                    {hasError && <p className="turn-warning" role="alert">Non riusciamo a verificare la disponibilità: riprova o chiamaci.</p>}
                    {hasTooFewSeats && <p className="turn-warning" role="alert">{seatsMessage}</p>}
                    {isSelectionStale && <p className="turn-warning" role="alert">Il turno scelto non è più disponibile: selezionane un altro.</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Note Speciali</label>
                    <textarea id="notes" name="notes" rows="3" maxLength={1000} value={formData.notes} onChange={handleChange} placeholder="Allergie, occasioni speciali, richieste particolari…"></textarea>
                </div>

                <div className="consent">
                    <input id="consent" type="checkbox" checked={formData.consent} onChange={(e) => updateField({ consent: e.target.checked })} required />
                    <label htmlFor="consent">
                        Acconsento al trattamento dei miei dati per gestire la prenotazione e all&apos;invio di comunicazioni via WhatsApp ed email
                        (conferma, promemoria, eventuali variazioni). Ho letto l&apos;<Link href="/privacy" target="_blank">informativa privacy</Link>. <span aria-hidden="true">*</span>
                    </label>
                </div>

                <button type="submit" className="btn btn-submit" disabled={status === 'loading' || hasTooFewSeats}>
                    {status === 'loading' ? 'Invio in corso…' : 'Prenota Tavolo'}
                </button>

                <div role="alert" aria-live="assertive" aria-atomic="true">
                    {status === 'error' && <p className="error-text">{errorMessage}</p>}
                </div>
            </form>

            <style jsx>{`
        .form-container {
          background: var(--color-ink);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-md);
          padding: var(--s-8);
        }

        @media (max-width: 600px) {
          .form-container { padding: var(--s-6); }
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

        .field-full { margin-bottom: var(--s-6); }

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

        label span { color: var(--color-brass-bright); }

        input:not([type="checkbox"]), textarea {
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          color: var(--color-paper);
          padding: var(--s-3);
          min-height: 44px;
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

        input:focus, textarea:focus { border-color: var(--color-brass-bright); outline: none; }
        input:focus-visible, textarea:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }

        textarea { resize: vertical; min-height: 80px; }

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
          width: 44px;
          height: 44px;
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

        .stepper button:hover:not(:disabled) { background: var(--color-brass); color: var(--color-ink); }
        .stepper button:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }
        .stepper button:disabled { opacity: 0.4; cursor: not-allowed; }

        .stepper span {
          font-family: var(--font-mono);
          font-size: 1.05rem;
          flex: 1;
          text-align: center;
          color: var(--color-paper);
        }

        .turn-group { margin-bottom: var(--s-6); }

        .turn-warning {
          font-size: 0.8125rem;
          color: var(--color-warning);
          margin: var(--s-2) 0 0;
        }

        .consent {
          display: flex;
          gap: var(--s-3);
          align-items: flex-start;
          margin-top: var(--s-6);
        }

        .consent input { width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px; accent-color: var(--color-brass); }
        .consent input:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: 2px; }

        .consent label {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          text-transform: none;
          letter-spacing: 0;
          line-height: 1.5;
          color: var(--color-text-soft);
        }

        .consent :global(a) { color: var(--color-brass-bright); text-decoration: underline; }

        .btn-submit {
          width: 100%;
          margin-top: var(--s-6);
          padding: 1rem;
          font-size: 0.9375rem;
          justify-content: center;
          display: block;
          text-align: center;
        }

        .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .error-text {
          color: var(--color-danger);
          text-align: center;
          margin-top: var(--s-4);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        @media (prefers-reduced-motion: reduce) {
          input, textarea, .stepper button { transition: none; }
        }
      `}</style>
        </div>
    );
}
