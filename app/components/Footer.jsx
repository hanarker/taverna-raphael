'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <div className="footer-brand-name">
              <span className="brand-taverna">Taverna</span>
              <span className="brand-script">Raphael</span>
            </div>
            <div className="footer-divider" aria-hidden="true" />
            <p className="footer-tagline">Delizie di mare, racconto autentico.<br />Sul golfo di Napoli dal 1987.</p>
          </div>

          <div className="footer-col">
            <h3>Link Rapidi</h3>
            <div className="footer-divider" aria-hidden="true" />
            <Link href="/menu">Menu</Link>
            <Link href="/prenotazioni">Prenotazioni</Link>
            <Link href="/news">News</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
            <Link href="/admin/login">Area Riservata</Link>
          </div>

          <div className="footer-col">
            <h3>Contatti</h3>
            <div className="footer-divider" aria-hidden="true" />
            <p>Piazza Antonio Sodani<br />Sant'Anastasia (NA)</p>
            <p>+081 898 3446<br />366 357 5967</p>
            <p>info@tavernaraphael.it</p>
          </div>

          <div className="footer-col">
            <h3>Orari</h3>
            <div className="footer-divider" aria-hidden="true" />
            <p>Lunedì–Domenica</p>
            <p>12:00 – 15:00</p>
            <p>19:00 – 23:00</p>
            <p className="footer-note">Chiuso il martedì a pranzo</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Taverna Raphael. Tutti i diritti riservati.</p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram Taverna Raphael">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook Taverna Raphael">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: var(--color-azzurro);
          color: #FFFFFF;
          padding: var(--s-16) 0 var(--s-8);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: var(--s-12);
          margin-bottom: var(--s-12);
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        .footer-brand-name {
          display: flex;
          flex-direction: column;
          margin-bottom: var(--s-4);
        }

        .brand-taverna {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #FFFFFF;
          line-height: 1.1;
        }

        .brand-script {
          font-family: var(--font-script);
          font-size: 1.75rem;
          color: var(--color-sabbia);
          line-height: 1.2;
        }

        .footer-tagline {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.65;
        }

        .footer-col h3 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 500;
          color: #FFFFFF;
          letter-spacing: 0;
          margin-bottom: var(--s-3);
          text-transform: none;
        }

        .footer-divider {
          width: 32px;
          height: 1px;
          background: var(--color-sabbia);
          margin-bottom: var(--s-4);
        }

        .footer-col p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.65;
          margin-bottom: var(--s-2);
        }

        .footer-note {
          font-size: 0.8125rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .footer-col :global(a) {
          display: block;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: var(--s-2);
          text-decoration: none;
          transition: color var(--dur-fast) var(--ease);
        }

        .footer-col :global(a):hover {
          color: var(--color-sabbia);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--s-6);
          border-top: 1px solid rgba(223, 185, 136, 0.35);
          gap: var(--s-4);
        }

        .footer-bottom p {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .footer-social {
          display: flex;
          gap: var(--s-4);
        }

        .footer-social :global(a) {
          color: rgba(255, 255, 255, 0.7);
          transition: color var(--dur-fast) var(--ease);
          display: flex;
          align-items: center;
        }

        .footer-social :global(a):hover {
          color: var(--color-sabbia);
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--s-12) var(--s-8);
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: var(--s-8);
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
