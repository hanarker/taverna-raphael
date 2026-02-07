'use client';

import ReservationForm from '../components/ReservationForm';

export default function ReservationPage() {
  return (
    <div className="page-container container">
      <div className="reservation-layout">
        <div className="reservation-info">
          <h1 className="page-title">Prenota un Tavolo</h1>
          <p>
            Vieni a scoprire i sapori authentici della nostra cucina.
            Per prenotazioni superiori a 10 persone, ti preghiamo di contattarci telefonicamente.
          </p>

          <div className="info-box">
            <h3>Orari di Apertura</h3>
            <p>Lun - Dom: 12:00 - 15:00 / 19:00 - 23:00</p>
          </div>

          <div className="info-box">
            <h3>Contatti</h3>
            <p>+39 02 12345678</p>
            <p>info@ristorante.it</p>
          </div>
        </div>

        <div className="reservation-form-wrapper">
          <ReservationForm />
        </div>
      </div>

      <style jsx>{`
        .page-container {
          padding-top: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
          min-height: 80vh;
        }

        .reservation-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .reservation-layout {
            grid-template-columns: 1fr;
          }
        }

        .page-title {
          font-size: 3rem;
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        .reservation-info p {
          color: var(--color-text-muted);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .info-box {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--color-surface);
          border-left: 3px solid var(--color-primary);
        }

        .info-box h3 {
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        
        .info-box p {
            margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
