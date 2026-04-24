'use client';

import ReservationForm from '../components/ReservationForm';

export default function ReservationPage() {
  return (
    <>
      {/* Hero compatto */}
      <div className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">Riserva il tuo tavolo</span>
          <h1>Prenotazioni</h1>
          <div className="divider-line" aria-hidden="true" />
        </div>
      </div>

      <div className="section container">
        <div className="reservation-layout">
          <div className="reservation-info">
            <div className="info-block">
              <span className="info-label">Dove</span>
              <p className="info-value">Piazza Antonio Sodani<br />Sant&apos;Anastasia (NA)</p>
            </div>
            <div className="info-block">
              <span className="info-label">Quando</span>
              <p className="info-value">
                Pranzo: 13:00 – 15:00<br />
                Cena: 19:30 – 21:30<br />
                Cena: 21:30 – 23:30
              </p>
              <p className="info-note">Chiuso il martedì a pranzo</p>
            </div>
            <div className="info-block">
              <span className="info-label">Contatti</span>
              <p className="info-value">+081 898 3446<br />366 357 5967</p>
              <p className="info-value">info@tavernaraphael.it</p>
            </div>
            <p className="info-footer">
              Per prenotazioni superiori a 10 persone, contattaci telefonicamente.
            </p>
          </div>

          <div className="reservation-form-wrapper">
            <ReservationForm />
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-hero {
          background: var(--color-panna);
          padding: calc(80px + var(--s-12)) 0 var(--s-12);
        }

        .page-hero-inner {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--s-2);
        }

        .page-hero-inner h1 {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1;
          margin: var(--s-2) 0 var(--s-4);
        }

        .reservation-layout {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: var(--s-16);
          align-items: start;
        }

        .reservation-info {
          padding-top: var(--s-4);
        }

        .info-block {
          margin-bottom: var(--s-8);
          padding-bottom: var(--s-8);
          border-bottom: 1px solid var(--color-line);
        }

        .info-block:last-of-type {
          border-bottom: none;
        }

        .info-label {
          display: block;
          font-family: var(--font-body);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--color-sabbia);
          margin-bottom: var(--s-3);
        }

        .info-value {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--color-ink);
          line-height: 1.5;
          margin-bottom: var(--s-2);
        }

        .info-note {
          font-size: 0.875rem;
          font-style: italic;
          color: var(--color-muted);
          margin: 0;
        }

        .info-footer {
          font-size: 0.875rem;
          color: var(--color-muted);
          line-height: 1.6;
          margin-top: var(--s-8);
        }

        @media (max-width: 900px) {
          .reservation-layout {
            grid-template-columns: 1fr;
            gap: var(--s-8);
          }
        }
      `}</style>
    </>
  );
}
