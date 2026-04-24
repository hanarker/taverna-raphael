'use client';

import Hero from './components/Hero';
import useRevealOnScroll from './hooks/useRevealOnScroll';

const featuredDishes = [
  {
    img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    name: 'Spaghetti alle Vongole',
    desc: 'Vongole veraci, aglio, vino bianco',
    price: '€18',
  },
  {
    img: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80',
    name: 'Branzino al Forno',
    desc: 'Con patate, olive e pomodorini',
    price: '€26',
  },
  {
    img: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=800&q=80',
    name: 'Fritto Misto di Mare',
    desc: 'Calamari, gamberi e alici freschissime',
    price: '€22',
  },
];

export default function Home() {
  const [refStoria, storiaVisible] = useRevealOnScroll();
  const [refPiatti, piattiVisible] = useRevealOnScroll();
  const [refPrenota, prenotaVisible] = useRevealOnScroll();

  return (
    <>
      <Hero />

      {/* Sezione 01 — La Nostra Storia */}
      <section
        ref={refStoria}
        className={`section section-storia reveal${storiaVisible ? ' is-visible' : ''}`}
      >
        <div className="container">
          <div className={`storia-grid reveal-stagger${storiaVisible ? ' is-visible' : ''}`}>
            <div className="storia-text">
              <span className="section-number">01</span>
              <span className="eyebrow">La Nostra Storia</span>
              <h2>Una tradizione<br />di mare dal 1987</h2>
              <p>
                Benvenuti alla Taverna Raphael, dove la tradizione marinara del golfo di Napoli
                incontra la passione per gli ingredienti freschi di stagione.
              </p>
              <p>
                Il nostro chef porta in tavola sapori autentici che raccontano il mare:
                ogni piatto è un viaggio tra le acque del Mediterraneo.
              </p>
              <a href="/menu" className="btn btn-ghost" style={{ marginTop: 'var(--s-8)', display: 'inline-block' }}>Scopri il Menu</a>
            </div>
            <div className="storia-media">
              <div className="storia-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
                  alt="Interno della Taverna Raphael"
                  className="storia-img"
                  loading="lazy"
                />
                <div className="storia-frame" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione 02 — Selezione dello Chef */}
      <section
        ref={refPiatti}
        className={`section section-piatti reveal${piattiVisible ? ' is-visible' : ''}`}
      >
        <div className="container">
          <div className="piatti-header">
            <span className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>Selezione dello chef</span>
            <h2 className="piatti-title">Piatti in Evidenza</h2>
            <div className="divider-line divider-line--center" aria-hidden="true" />
          </div>
          <div className={`piatti-grid reveal-stagger${piattiVisible ? ' is-visible' : ''}`}>
            {featuredDishes.map((dish) => (
              <div className="piatto" key={dish.name}>
                <div className="piatto-media">
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="piatto-img"
                    loading="lazy"
                  />
                </div>
                <div className="piatto-body">
                  <div className="piatto-row">
                    <span className="piatto-name">{dish.name}</span>
                    <span className="piatto-price">{dish.price}</span>
                  </div>
                  <p className="piatto-desc">{dish.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="piatti-cta">
            <a href="/menu" className="btn">Vedi il Menu Completo</a>
          </div>
        </div>
      </section>

      {/* Banda 03 — Prenota */}
      <section
        ref={refPrenota}
        className={`section-prenota reveal${prenotaVisible ? ' is-visible' : ''}`}
      >
        <div className="container prenota-inner">
          <div className="prenota-text">
            <span className="eyebrow" style={{ color: 'var(--color-sabbia)' }}>Riserva il tuo tavolo</span>
            <h2 className="prenota-title">Vivi un&#8217;esperienza<br />indimenticabile</h2>
          </div>
          <a href="/prenotazioni" className="btn" style={{ flexShrink: 0 }}>Prenota ora</a>
        </div>
      </section>

      <style jsx>{`
        /* ---- Sezione Storia ---- */
        .section-storia {
          background: var(--color-panna);
        }

        .storia-grid {
          display: grid;
          grid-template-columns: 7fr 5fr;
          gap: var(--s-16);
          align-items: center;
        }

        .storia-text .section-number {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 0.875rem;
          color: var(--color-muted);
          display: block;
          margin-bottom: var(--s-1);
        }

        .storia-text h2 {
          font-size: clamp(2rem, 3.5vw, 3rem);
          line-height: 1.15;
          margin-bottom: var(--s-6);
          margin-top: var(--s-3);
        }

        .storia-text p {
          color: var(--color-muted);
          font-size: 1.0625rem;
          line-height: 1.7;
          margin-bottom: var(--s-4);
        }

        .storia-media {
          position: relative;
        }

        .storia-img-wrapper {
          position: relative;
        }

        .storia-img {
          width: 100%;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          display: block;
          border-radius: var(--r-sm);
          position: relative;
          z-index: 1;
        }

        .storia-frame {
          position: absolute;
          inset: 12px -12px -12px 12px;
          border: 1px solid var(--color-sabbia);
          border-radius: var(--r-sm);
          z-index: 0;
          pointer-events: none;
        }

        /* ---- Sezione Piatti ---- */
        .section-piatti {
          background: var(--color-bg);
        }

        .piatti-header {
          margin-bottom: var(--s-12);
        }

        .piatti-title {
          font-size: clamp(2rem, 3vw, 2.75rem);
          text-align: center;
          margin-top: var(--s-3);
          margin-bottom: var(--s-4);
        }

        .piatti-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--s-8);
        }

        .piatto-media {
          overflow: hidden;
          aspect-ratio: 4 / 5;
          border-radius: var(--r-sm);
          margin-bottom: var(--s-4);
        }

        .piatto-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform var(--dur-base) var(--ease);
        }

        .piatto:hover .piatto-img {
          transform: scale(1.03);
        }

        .piatto-body {
          padding: 0;
        }

        .piatto-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: var(--s-2);
          margin-bottom: var(--s-2);
        }

        .piatto-name {
          font-family: var(--font-display);
          font-size: 1.375rem;
          font-weight: 500;
          color: var(--color-ink);
        }

        .piatto-price {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--color-sabbia);
          flex-shrink: 0;
        }

        .piatto-desc {
          font-size: 0.875rem;
          color: var(--color-muted);
          line-height: 1.5;
          margin: 0;
          font-style: italic;
        }

        .piatti-cta {
          text-align: center;
          margin-top: var(--s-12);
        }

        /* ---- Banda Prenota ---- */
        .section-prenota {
          background: var(--color-azzurro);
          padding: var(--s-16) 0;
        }

        .prenota-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--s-8);
        }

        .prenota-title {
          font-size: clamp(1.75rem, 2.5vw, 2.5rem);
          color: #FFFFFF;
          margin-top: var(--s-2);
        }

        /* ---- Responsive ---- */
        @media (max-width: 1024px) {
          .piatti-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .storia-grid {
            grid-template-columns: 1fr;
            gap: var(--s-8);
          }
          .storia-frame { display: none; }
          .piatti-grid { grid-template-columns: 1fr; }
          .prenota-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}
