'use client';

import useRevealOnScroll from '../../hooks/useRevealOnScroll';

// TODO: sostituire con l'URL reale dello shop online Aulivella quando disponibile.
const AULIVELLA_SHOP_URL = '#';

export default function AulivellaSection() {
  const [refCard, cardVisible] = useRevealOnScroll();
  const [refCta, ctaVisible] = useRevealOnScroll();

  return (
    <section id="aulivella" className="section aulivella-section">
      <div className="container aulivella-grid">
        <div ref={refCard} className={`aulivella-card reveal${cardVisible ? ' is-visible' : ''}`}>
          <div className="aulivella-art">
            <img src="/vetrina/aulivella.jpg" alt="Colomba artigianale Aulivella" loading="lazy" />
          </div>
          <span className="eyebrow">Chiedi al nostro staff</span>
          <h3>Colomba &ldquo;Aulivella&rdquo;</h3>
          <p>Aulivella &ndash; &apos;A Colomba ca Pellecchiella. Da Aulivella la tradizione incontra la Pasqua con un dolce che profuma di casa.</p>
          <p>Nasce &ldquo;&apos;A Colomba ca Pellecchiella&rdquo;, la nostra colomba artigianale arricchita con la dolcezza delle pellecchielle del Vesuvio, simbolo della nostra terra. Soffice, profumata e preparata con ingredienti selezionati.</p>
          <span className="ask">Chiedi al nostro staff!</span>
        </div>

        <div ref={refCta} className={`aulivella-cta reveal${ctaVisible ? ' is-visible' : ''}`}>
          <span className="eyebrow">Il nostro e-commerce</span>
          <h2>Aulivella, anche a casa tua.</h2>
          <p>Scopri la colomba artigianale e le altre specialità Aulivella: ordina online e ricevile comodamente a casa.</p>
          <a href={AULIVELLA_SHOP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-shop">
            Visita il nostro e-commerce
          </a>
        </div>
      </div>

      <style jsx>{`
        .aulivella-section {
          background: var(--color-ink-light);
        }

        .aulivella-grid {
          display: grid;
          grid-template-columns: 0.85fr 1fr;
          gap: var(--s-16);
          align-items: center;
        }

        .aulivella-art {
          background: var(--color-ink);
          border: 1px solid var(--color-line);
          border-radius: var(--r-sm);
          overflow: hidden;
          aspect-ratio: 3 / 4;
          margin-bottom: var(--s-4);
        }

        .aulivella-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          filter: saturate(0.94);
        }

        .aulivella-card h3 {
          font-size: 1.3rem;
          margin-bottom: var(--s-3);
        }

        .aulivella-card p {
          color: var(--color-text-soft);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: var(--s-3);
        }

        .ask {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: var(--color-brass-bright);
          text-transform: uppercase;
        }

        .aulivella-cta {
          text-align: center;
          padding: var(--s-16) var(--s-8);
          background: var(--color-ink);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-md);
        }

        .aulivella-cta h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          margin-bottom: var(--s-4);
        }

        .aulivella-cta p {
          color: var(--color-text-soft);
          max-width: 380px;
          margin: 0 auto var(--s-8);
        }

        .btn-shop {
          font-size: 1rem;
          padding: 1.1rem 2.5rem;
        }

        @media (max-width: 860px) {
          .aulivella-grid {
            grid-template-columns: 1fr;
          }

          .aulivella-cta {
            padding: var(--s-12) var(--s-6);
          }
        }
      `}</style>
    </section>
  );
}
