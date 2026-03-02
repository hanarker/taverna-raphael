'use client';

import { useState } from 'react';

export default function ReservationForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: '',
        notes: '',
    });

    const [status, setStatus] = useState('idle');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Errore durante la prenotazione');

            setStatus('success');
            setFormData({
                firstName: '', lastName: '', email: '', phone: '',
                date: '', time: '', guests: '', notes: '',
            });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="reservation-form-container">
            {status === 'success' ? (
                <div className="success-message">
                    <div className="success-icon">✦</div>
                    <h3>Grazie per la tua prenotazione!</h3>
                    <p>Ti abbiamo inviato una conferma via email.</p>
                    <button className="btn mt-4" onClick={() => setStatus('idle')}>Nuova Prenotazione</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="reservation-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Mario" />
                        </div>
                        <div className="form-group">
                            <label>Cognome</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Rossi" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="mario@email.it" />
                        </div>
                        <div className="form-group">
                            <label>Telefono</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+39 02 12345678" />
                        </div>
                    </div>

                    <div className="form-row three-cols">
                        <div className="form-group">
                            <label>Data</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Ora</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Ospiti</label>
                            <input type="number" name="guests" min="1" max="10" value={formData.guests} onChange={handleChange} required placeholder="2" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Note Speciali</label>
                        <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Allergie, occasioni speciali, richieste particolari..."></textarea>
                    </div>

                    <button type="submit" className="btn btn-full" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Invio in corso...' : 'Prenota Tavolo'}
                    </button>

                    {status === 'error' && <p className="error-text">Si è verificato un errore. Riprova.</p>}
                </form>
            )}

            <style jsx>{`
        .reservation-form-container {
          background: rgba(30, 65, 105, 0.85);
          padding: 2.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(8px);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .form-row.three-cols {
          grid-template-columns: 1fr 1fr 1fr;
        }

        @media (max-width: 600px) {
          .form-row,
          .form-row.three-cols { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.25rem;
        }

        label {
          margin-bottom: 0.4rem;
          font-size: 0.75rem;
          font-family: var(--font-heading);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--gold-accent);
        }

        input, textarea {
          padding: 0.75rem 1rem;
          background: rgba(10, 35, 70, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-bottom: 2px solid rgba(255, 255, 255, 0.55);
          color: #ffffff;
          border-radius: 4px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          transition: border-color 0.2s ease, background 0.2s ease;
          /* Fix testo nativo data/ora nei browser WebKit */
          color-scheme: dark;
        }

        /* Testo placeholder nativo per date/time (webkit) */
        input::-webkit-datetime-edit {
          color: var(--text-white);
        }
        input::-webkit-datetime-edit-fields-wrapper {
          color: var(--text-white);
        }
        input::-webkit-datetime-edit-text {
          color: rgba(255, 255, 255, 0.5);
        }
        input::-webkit-datetime-edit-day-field,
        input::-webkit-datetime-edit-month-field,
        input::-webkit-datetime-edit-year-field,
        input::-webkit-datetime-edit-hour-field,
        input::-webkit-datetime-edit-minute-field {
          color: var(--text-white);
        }
        input::-webkit-datetime-edit-day-field:focus,
        input::-webkit-datetime-edit-month-field:focus,
        input::-webkit-datetime-edit-year-field:focus,
        input::-webkit-datetime-edit-hour-field:focus,
        input::-webkit-datetime-edit-minute-field:focus {
          background: var(--gold-accent);
          color: var(--bg-blue);
          border-radius: 2px;
        }

        /* Icona calendario/orologio: gold */
        input::-webkit-calendar-picker-indicator {
          filter: invert(1) sepia(1) saturate(2) hue-rotate(5deg) brightness(1.1);
          cursor: pointer;
          opacity: 0.8;
        }
        input::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }

        /* Placeholder testo libero */
        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }

        input:focus, textarea:focus {
          border-color: var(--gold-accent);
          border-bottom-color: var(--gold-accent);
          background: rgba(10, 35, 70, 0.9);
          outline: none;
        }

        textarea {
          resize: vertical;
          min-height: 90px;
        }

        .btn-full {
          width: 100%;
          margin-top: 1.5rem;
          padding: 1rem;
          font-size: 1rem;
          letter-spacing: 2px;
        }

        .success-message {
          text-align: center;
          padding: 3rem 2rem;
        }

        .success-icon {
          font-size: 2rem;
          color: var(--gold-accent);
          margin-bottom: 1rem;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .success-message h3 {
          color: var(--gold-accent);
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .success-message p {
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
        }

        .error-text {
          color: #ff6b6b;
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .mt-4 { margin-top: 1rem; display: inline-block; }
      `}</style>
        </div>
    );
}
