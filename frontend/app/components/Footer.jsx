'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Link href="/" className="footer-logo" aria-label="Taverna Raphael — torna alla homepage">
          <Image src="/vetrina/logo.png" alt="Taverna Raphael" width={74} height={54} className="footer-logo-img" />
        </Link>

        <nav className="footer-links" aria-label="Link di servizio">
          <Link href="/menu">Menu</Link>
          <Link href="/news">News</Link>
          <Link href="/cookie-policy">Cookie Policy</Link>
          <Link href="/admin/login">Area Riservata</Link>
          <span className="footer-social-group">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram Taverna Raphael">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook Taverna Raphael">Facebook</a>
          </span>
        </nav>

        <p className="footer-fine" suppressHydrationWarning>
          &copy; {new Date().getFullYear()} Taverna Raphael — Piazza Sodani 1, Sant&apos;Anastasia (NA)
        </p>

        <p className="footer-credit">Powered by Pama Social Media Partner</p>
      </div>

      <style jsx>{`
        .footer {
          padding: var(--s-12) 0;
          border-top: 1px solid var(--color-line);
        }

        .footer-inner {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: var(--s-6);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .footer-logo-img {
          display: block;
          height: 54px;
          width: auto;
        }

        .footer-links {
          display: flex;
          gap: var(--s-6);
          flex-wrap: wrap;
        }

        .footer-links :global(a) {
          font-size: 0.85rem;
          color: var(--color-text-soft);
          transition: color var(--dur-fast) var(--ease);
        }

        .footer-links :global(a):hover {
          color: var(--color-brass-bright);
        }

        .footer-social-group {
          display: flex;
          gap: var(--s-6);
          padding-left: var(--s-6);
          border-left: 1px solid var(--color-line-strong);
        }

        .footer-fine {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--color-text-dim);
        }

        .footer-credit {
          width: 100%;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-text-dim);
          opacity: 0.6;
          margin-top: var(--s-2);
        }

        @media (max-width: 640px) {
          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
        }
      `}</style>
    </footer>
  );
}
