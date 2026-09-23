'use client';

import useRevealOnScroll from '../../hooks/useRevealOnScroll';
import ReservationForm from '../ReservationForm';

export default function PrenotaSection() {
  const [refInfo, infoVisible] = useRevealOnScroll();
  const [refForm, formVisible] = useRevealOnScroll();

  return (
    <section id="prenota" className="prenota-section">
      <div className="container prenota-wrap">
        <div ref={refInfo} className={`prenota-info reveal${infoVisible ? ' is-visible' : ''}`}>
          <span className="eyebrow">Prenotazione diretta</span>
          <h2>Riserviamo il tavolo, tu pensa alla fame.</h2>
          <p>Confermiamo ogni richiesta entro poche ore. Per gruppi oltre le 8 persone o eventi privati, scrivici direttamente.</p>
          <div className="info-row"><div className="k">Telefono</div><div>+39 366 357 5967</div></div>
          <div className="info-row"><div className="k">Servizi</div><div>Pranzo e cena, dal martedì alla domenica</div></div>
          <div className="info-row"><div className="k">Chiusura</div><div>Lunedì</div></div>
        </div>

        <div ref={refForm} className={`reveal${formVisible ? ' is-visible' : ''}`}>
          <ReservationForm />
        </div>
      </div>

      <style jsx>{`
        .prenota-section {
          background: var(--color-ink-light);
          border-top: 1px solid var(--color-line);
          border-bottom: 1px solid var(--color-line);
          padding: var(--s-24) 0;
        }

        .prenota-wrap {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: var(--s-16);
          max-width: 1080px;
          align-items: flex-start;
        }

        .prenota-info h2 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin-bottom: var(--s-4);
        }

        .prenota-info p {
          color: var(--color-text-soft);
          margin-bottom: var(--s-6);
          max-width: 400px;
        }

        .info-row {
          display: flex;
          gap: var(--s-4);
          margin-bottom: var(--s-4);
          font-size: 0.92rem;
          color: var(--color-text-soft);
        }

        .info-row .k {
          font-family: var(--font-mono);
          color: var(--color-brass-bright);
          min-width: 90px;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding-top: 2px;
        }

        @media (max-width: 860px) {
          .prenota-wrap {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
