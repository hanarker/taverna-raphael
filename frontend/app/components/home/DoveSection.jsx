'use client';

import useRevealOnScroll from '../../hooks/useRevealOnScroll';

const MAPS_URL = 'https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIQCAEQLhivARjHARiABBiOBTIGCAIQIxgnMgcIAxAAGIAEMggIBBAAGBYYHjIICAUQABgWGB4yCAgGEAAYFhgeMggIBxAAGBYYHjIICAgQABgWGB4yCAgJEAAYFhge0gEJMzEyOWowajE1qAIIsAIB8QVbE-PxWV7GKg&um=1&ie=UTF-8&fb=1&gl=it&sa=X&geocode=KUd3JElorzsTMbSgkpJIwWot&daddr=Piazza+Antonio,+Via+Sodani,+1/2,+80048+Sant%27Anastasia+NA';

export default function DoveSection() {
  const [refInfo, infoVisible] = useRevealOnScroll();
  const [refMap, mapVisible] = useRevealOnScroll();

  return (
    <section id="dove" className="section dove-section">
      <div className="container dove-grid">
        <div ref={refInfo} className={`reveal${infoVisible ? ' is-visible' : ''}`}>
          <span className="eyebrow">Dove siamo</span>
          <h2>Nel cuore del vesuviano, sorge la nostra taverna di mare.</h2>
          <table className="hours-table">
            <tbody>
              <tr><td>Indirizzo</td><td>Piazza Sodani 1, 80040 Sant&apos;Anastasia (NA)</td></tr>
              <tr><td>Orari</td><td>Pranzo e cena, mar–dom</td></tr>
              <tr><td>Chiuso</td><td>Lunedì</td></tr>
              <tr><td>Telefono</td><td>+39 366 357 5967</td></tr>
            </tbody>
          </table>
        </div>

        <a
          ref={refMap}
          className={`map-art reveal${mapVisible ? ' is-visible' : ''}`}
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/vetrina/map.jpg" alt="Mappa stilizzata con la posizione di Taverna Raphael" loading="lazy" />
          <span className="map-cta">Apri in Google Maps →</span>
        </a>
      </div>

      <style jsx>{`
        .dove-section {
          background: var(--color-ink);
        }

        .dove-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--s-16);
          align-items: center;
        }

        .dove-grid h2 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin-bottom: var(--s-6);
        }

        .hours-table {
          width: 100%;
          font-family: var(--font-mono);
          font-size: 0.88rem;
          border-collapse: collapse;
        }

        .hours-table tr {
          border-bottom: 1px solid var(--color-line);
        }

        .hours-table td {
          padding: var(--s-3) 0;
          color: var(--color-text-soft);
        }

        .hours-table td:last-child {
          text-align: right;
          color: var(--color-brass-bright);
        }

        .map-art {
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          aspect-ratio: 4 / 3;
          overflow: hidden;
          display: block;
          text-decoration: none;
          position: relative;
          transition: border-color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
        }

        .map-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform var(--dur-slow) var(--ease);
        }

        .map-art:hover {
          border-color: var(--color-brass);
          transform: translateY(-3px);
        }

        .map-art:hover img {
          transform: scale(1.04);
        }

        .map-cta {
          position: absolute;
          left: var(--s-4);
          bottom: var(--s-4);
          padding: 0.4rem 0.85rem;
          background: rgba(13, 35, 43, 0.85);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          color: var(--color-brass-bright);
        }

        @media (max-width: 860px) {
          .dove-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
