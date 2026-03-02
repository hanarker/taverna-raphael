'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>Taverna Raphael</h3>
            <p>Cucina di mare autentica nel cuore della città.</p>
          </div>
          <div className="footer-col">
            <h3>Link Rapidi</h3>
            <Link href="/menu">Menu</Link>
            <Link href="/prenotazioni">Prenotazioni</Link>
            <Link href="/news">News</Link>
            <Link href="/admin/login">Area Riservata</Link>
          </div>
          <div className="footer-col">
            <h3>Contatti</h3>
            <p>Via Roma 1, Milano</p>
            <p>+39 02 12345678</p>
            <p>info@tavernaraphael.it</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Taverna Raphael. Tutti i diritti riservati.</p>
        </div>
      </div>
      <style jsx>{`
        .footer {
          background: var(--color-surface-dark);
          padding: 4rem 0 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        .footer-col h3 {
          color: var(--gold-accent);
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .footer-col p {
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 0.5rem;
        }

        .footer-col :global(a) {
          display: block;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 0.5rem;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-col :global(a):hover {
          color: var(--text-white);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.75);
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
}
