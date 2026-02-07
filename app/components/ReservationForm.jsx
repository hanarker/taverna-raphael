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

    const [status, setStatus] = useState('idle'); // idle, loading, success, error

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Errore durante la prenotazione');

            setStatus('success');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                date: '',
                time: '',
                guests: '',
                notes: '',
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
                    <h3>Grazie per la tua prenotazione!</h3>
                    <p>Ti abbiamo inviato una conferma via email.</p>
                    <button className="btn mt-4" onClick={() => setStatus('idle')}>Nuova Prenotazione</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="reservation-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Cognome</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Telefono</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
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
                            <input type="number" name="guests" min="1" max="10" value={formData.guests} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Note Speciali</label>
                        <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange}></textarea>
                    </div>

                    <button type="submit" className="btn btn-full" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Invio in corso...' : 'Prenota Tavolo'}
                    </button>

                    {status === 'error' && <p className="error-text">Si è verificato un errore. Riprova.</p>}
                </form>
            )}

            <style jsx>{`
        .reservation-form-container {
          background: var(--color-surface);
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        @media (max-width: 600px) {
            .form-row { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }

        label {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }

        input, textarea {
          padding: 0.8rem;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          border-radius: 4px;
          font-family: inherit;
        }

        input:focus, textarea:focus {
          border-color: var(--color-primary);
          outline: none;
        }

        .btn-full {
          width: 100%;
          margin-top: 1rem;
        }

        .success-message {
          text-align: center;
          padding: 2rem;
        }

        .success-message h3 {
          color: var(--color-primary);
        }

        .error-text {
          color: #ff4444;
          text-align: center;
          margin-top: 1rem;
        }
      `}</style>
        </div>
    );
}
