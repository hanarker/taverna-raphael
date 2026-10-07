'use client';

import useRevealOnScroll from '../../hooks/useRevealOnScroll';

// TODO: sostituire con l'URL reale dello shop online Aulivella quando disponibile.
const AULIVELLA_SHOP_URL = '#';

export default function AulivellaSection() {
  const [refBlock, isVisible] = useRevealOnScroll();

  return (
    <section id="aulivella" className="section aulivella-section">
      <div ref={refBlock} className={`container aulivella-block reveal${isVisible ? ' is-visible' : ''}`}>
        <figure className="aulivella-art">
          <img src="/vetrina/aulivella.jpg" alt="Lo chef con la colomba artigianale Aulivella davanti all'insegna della Taverna Raphael" loading="lazy" />
        </figure>

        <div className="aulivella-content">
          <span className="eyebrow">Il nostro e-commerce</span>
          <h2>Aulivella, anche a casa tua.</h2>
          <p className="lead">Scopri la colomba artigianale e le altre specialità Aulivella: ordina online e ricevile comodamente a casa.</p>

          <div className="product">
            <span className="eyebrow">Chiedi al nostro staff</span>
            <h3>Colomba &ldquo;Aulivella&rdquo;</h3>
            <p>Aulivella &ndash; &apos;A Colomba ca Pellecchiella. Da Aulivella la tradizione incontra la Pasqua con un dolce che profuma di casa.</p>
            <p>Nasce &ldquo;&apos;A Colomba ca Pellecchiella&rdquo;, la nostra colomba artigianale arricchita con la dolcezza delle pellecchielle del Vesuvio, simbolo della nostra terra. Soffice, profumata e preparata con ingredienti selezionati.</p>
          </div>

          <a href={AULIVELLA_SHOP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-shop">
            Visita il nostro e-commerce
          </a>
        </div>
      </div>

      <style jsx>{`
        .aulivella-section {
          background: var(--color-ink-light);
        }

        .aulivella-block {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
          gap: var(--s-16);
          align-items: stretch;
        }

        .aulivella-art {
          margin: 0;
          background: var(--color-ink);
          border: 1px solid var(--color-line);
          border-radius: var(--r-md);
          overflow: hidden;
          min-height: 420px;
        }

        .aulivella-art img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          filter: saturate(0.94);
        }

        .aulivella-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: var(--s-4);
        }

        .aulivella-content h2 {
          font-size: clamp(1.9rem, 3.2vw, 2.8rem);
          line-height: 1.1;
          margin: 0;
        }

        .lead {
          color: var(--color-text-soft);
          font-size: var(--fs-body);
          line-height: 1.6;
          max-width: 46ch;
          margin: 0;
        }

        .product {
          width: 100%;
          margin: var(--s-4) 0;
          padding: var(--s-6);
          background: var(--color-ink);
          border: 1px solid var(--color-line);
          border-left: 2px solid var(--color-brass);
          border-radius: var(--r-md);
        }

        .product h3 {
          font-size: 1.3rem;
          margin: var(--s-2) 0 var(--s-3);
        }

        .product p {
          color: var(--color-text-soft);
          font-size: 0.9375rem;
          line-height: 1.6;
          max-width: 60ch;
          margin: 0 0 var(--s-3);
        }

        .product p:last-child {
          margin-bottom: 0;
        }

        .btn-shop {
          min-height: 48px;
          padding: 0 var(--s-8);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        @media (max-width: 860px) {
          .aulivella-block {
            grid-template-columns: 1fr;
            gap: var(--s-8);
          }

          .aulivella-art {
            min-height: 0;
            aspect-ratio: 4 / 3;
          }

          .btn-shop {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .product {
            padding: var(--s-4);
          }
        }
      `}</style>
    </section>
  );
}
