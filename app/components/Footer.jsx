'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>Ristorante</h3>
            <p>Un'esperienza culinaria unica nel cuore della città.</p>
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
            <p>info@ristorante.it</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Ristorante. Tutti i diritti riservati.</p>
        </div>
      </div>
      <style jsx>{`
        .footer {
          background: var(--color-surface);
          padding: 4rem 0 2rem;
          border-top: 1px solid var(--color-border);
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
          color: var(--color-primary);
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .footer-col p {
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
        }

        .footer-col :global(a) {
          display: block;
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-col :global(a):hover {
          color: var(--color-primary);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
}
