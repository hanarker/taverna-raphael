'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const burgerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    // Focus al primo link all'apertura; ripristina al burger alla chiusura
    useEffect(() => {
        if (menuOpen) {
            const panel = document.getElementById('mobile-menu');
            const first = panel?.querySelector('a[href], button:not([disabled])');
            setTimeout(() => first?.focus(), 80);
        } else {
            burgerRef.current?.focus();
        }
    }, [menuOpen]);

    // ESC chiude il menu
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // Focus trap dentro il pannello
    useEffect(() => {
        if (!menuOpen) return;
        const trap = (e) => {
            if (e.key !== 'Tab') return;
            const panel = document.getElementById('mobile-menu');
            if (!panel) return;
            const focusable = Array.from(panel.querySelectorAll('a[href], button:not([disabled])'));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', trap);
        return () => document.removeEventListener('keydown', trap);
    }, [menuOpen]);

    const isActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav
            className={`navbar ${scrolled ? 'scrolled' : 'solid'} ${menuOpen ? 'is-menu-open' : ''}`}
            role="navigation"
            aria-label="Navigazione principale"
        >
            <div className="container nav-content">
                <Link href="/" className="logo" aria-label="Taverna Raphael — torna alla homepage">
                    <Image
                        src="/logo.png"
                        alt="Taverna Raphael"
                        width={120}
                        height={60}
                        className="logo-img"
                        priority
                    />
                </Link>

                <div className="nav-links">
                    <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} aria-current={isActive('/') ? 'page' : undefined}>Home</Link>
                    <Link href="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`} aria-current={isActive('/menu') ? 'page' : undefined}>Menu</Link>
                    <Link href="/news" className={`nav-link ${isActive('/news') ? 'active' : ''}`} aria-current={isActive('/news') ? 'page' : undefined}>News</Link>
                    <Link href="/prenotazioni" className={`btn-nav ${isActive('/prenotazioni') ? 'active' : ''}`} aria-current={isActive('/prenotazioni') ? 'page' : undefined}>Prenota</Link>
                </div>

                <button
                    ref={burgerRef}
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                    aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
                >
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                </button>
            </div>

            {menuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                id="mobile-menu"
                className={`mobile-menu ${menuOpen ? 'open' : ''}`}
                aria-hidden={!menuOpen}
            >
                <div className="panel-inner">
                    <div className="mobile-lockup" aria-hidden="true">
                        <span className="mobile-lockup-taverna">Taverna</span>
                        <div className="mobile-ornament">
                            <span className="mob-line mob-line-l" />
                            <svg
                                width="22" height="14" viewBox="0 0 22 14"
                                fill="none" xmlns="http://www.w3.org/2000/svg"
                                className="mob-fish"
                                aria-hidden="true"
                            >
                                <path d="M16 7C16 7 11 1.5 3 1.5C3 1.5 6.5 7 3 12.5C11 12.5 16 7 16 7Z" stroke="currentColor" strokeWidth="1" fill="none"/>
                                <path d="M18 4L22 7L18 10" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="5.5" cy="6.5" r="0.75" fill="currentColor"/>
                            </svg>
                            <span className="mob-line mob-line-r" />
                        </div>
                        <span className="mobile-lockup-raphael">Raphael</span>
                    </div>

                    <ol className="mobile-nav-list" role="list">
                        <li className="mobile-nav-item">
                            <span className="section-number" aria-hidden="true">01</span>
                            <Link
                                href="/"
                                className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                                aria-current={isActive('/') ? 'page' : undefined}
                            >Home</Link>
                        </li>
                        <li className="mobile-nav-item">
                            <span className="section-number" aria-hidden="true">02</span>
                            <Link
                                href="/menu"
                                className={`mobile-nav-link ${isActive('/menu') ? 'active' : ''}`}
                                aria-current={isActive('/menu') ? 'page' : undefined}
                            >Menu</Link>
                        </li>
                        <li className="mobile-nav-item">
                            <span className="section-number" aria-hidden="true">03</span>
                            <Link
                                href="/news"
                                className={`mobile-nav-link ${isActive('/news') ? 'active' : ''}`}
                                aria-current={isActive('/news') ? 'page' : undefined}
                            >News</Link>
                        </li>
                    </ol>

                    <Link
                        href="/prenotazioni"
                        className={`mobile-cta-full ${isActive('/prenotazioni') ? 'active' : ''}`}
                        aria-current={isActive('/prenotazioni') ? 'page' : undefined}
                    >
                        Prenota un tavolo
                    </Link>

                    <span className="mob-divider" aria-hidden="true" />

                    <div className="mobile-contacts">
                        <p className="eyebrow mob-contacts-label">Contatti</p>
                        <a href="tel:+390818983446" className="mobile-contact-tel">+39 081 898 3446</a>
                        <a href="tel:+393663575967" className="mobile-contact-tel">366 357 5967</a>
                        <address className="mobile-contact-addr">
                            Piazza Antonio Sodani<br />Sant'Anastasia (NA)
                        </address>
                        <p className="mobile-contact-hours">
                            Lun–Dom 12:00–15:00 · 19:00–23:00<br />
                            <em>Martedì pranzo chiuso</em>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        /* ===== NAVBAR BASE ===== */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 0.5rem 0;
          transition: background var(--dur-base) var(--ease),
                      border-color var(--dur-base) var(--ease),
                      box-shadow var(--dur-base) var(--ease);
          border-bottom: 1px solid transparent;
        }

        .navbar.solid {
          background: var(--color-azzurro);
          border-bottom-color: rgba(108, 146, 181, 0.4);
        }

        .navbar.scrolled {
          background: var(--color-azzurro);
          border-bottom-color: rgba(108, 146, 181, 0.4);
          box-shadow: 0 2px 16px rgba(27, 42, 56, 0.14);
        }

        .navbar.is-menu-open {
          background: transparent;
          border-bottom-color: transparent;
          box-shadow: none;
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--s-8);
          position: relative;
          z-index: 1200;
        }

        .logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .logo-img { display: block; }

        /* ===== DESKTOP NAV ===== */
        .nav-links {
          display: flex;
          gap: var(--s-8);
          align-items: center;
        }

        .nav-link {
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.9);
          position: relative;
          padding-bottom: 3px;
          transition: color var(--dur-fast) var(--ease);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--color-sabbia);
          transition: width var(--dur-base) var(--ease);
        }

        .nav-link:hover::after,
        .nav-link.active::after { width: 100%; }

        .nav-link:hover { color: #FFFFFF; }

        .btn-nav {
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 400;
          letter-spacing: 0.04em;
          padding: 0.5rem 1.25rem;
          border: 1.5px solid rgba(255, 255, 255, 0.55);
          border-radius: var(--r-sm);
          color: #FFFFFF;
          background: transparent;
          transition: background var(--dur-fast) var(--ease),
                      color var(--dur-fast) var(--ease),
                      border-color var(--dur-fast) var(--ease);
        }

        .btn-nav:hover,
        .btn-nav.active {
          background: rgba(255, 255, 255, 0.18);
          border-color: #FFFFFF;
          color: #FFFFFF;
        }

        /* ===== HAMBURGER ===== */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 26px;
          height: 18px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .hamburger-line {
          display: block;
          width: 100%;
          height: 1.5px;
          background: rgba(255, 255, 255, 0.9);
          transition: transform var(--dur-base) var(--ease),
                      opacity var(--dur-base) var(--ease),
                      background var(--dur-base) var(--ease);
          transform-origin: center;
        }

        .hamburger.open .hamburger-line {
          background: var(--color-ink);
        }

        .hamburger-line.open:nth-child(1) { transform: translateY(8.25px) rotate(45deg); }
        .hamburger-line.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger-line.open:nth-child(3) { transform: translateY(-8.25px) rotate(-45deg); }

        /* ===== MOBILE OVERLAY ===== */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(27, 42, 56, 0.45);
          z-index: 1050;
          animation: fadeIn 250ms var(--ease) both;
        }

        /* ===== MOBILE MENU — FULLSCREEN TAKEOVER ===== */
        .mobile-menu {
          display: none;
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          background: var(--color-bg);
          z-index: 1100;
          overflow-y: auto;
          flex-direction: column;
          clip-path: inset(0 0 100% 0);
          transition: clip-path 700ms var(--ease-out-expo);
        }

        .mobile-menu.open {
          clip-path: inset(0 0 0% 0);
        }

        /* Colonna interna centrata */
        .panel-inner {
          max-width: 400px;
          margin: 0 auto;
          width: 100%;
          padding: 90px var(--s-6) var(--s-12);
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100%;
        }

        /* Brand lockup */
        .mobile-lockup {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: var(--s-10);
          width: 100%;
        }

        .mobile-lockup-taverna {
          font-family: var(--font-display);
          font-size: clamp(2rem, 8vw, 2.75rem);
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--color-ink);
          line-height: 1;
        }

        .mobile-ornament {
          display: flex;
          align-items: center;
          gap: var(--s-3);
          margin: var(--s-2) 0;
          color: var(--color-sabbia);
        }

        .mob-line {
          display: block;
          width: 32px;
          height: 1px;
          background: var(--color-sabbia);
          transform-origin: left;
        }

        .mob-line-r {
          transform-origin: right;
        }

        .mob-fish {
          color: var(--color-sabbia);
          flex-shrink: 0;
        }

        .mobile-lockup-raphael {
          font-family: var(--font-script);
          font-size: clamp(2.25rem, 9vw, 3.25rem);
          color: var(--color-sabbia);
          line-height: 1.1;
          margin-top: -0.1em;
        }

        /* Nav list */
        .mobile-nav-list {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--s-6);
          display: flex;
          flex-direction: column;
          gap: var(--s-2);
          width: 100%;
        }

        .mobile-nav-item {
          display: flex;
          align-items: baseline;
          gap: var(--s-3);
        }

        .section-number {
          font-family: var(--font-display);
          font-size: 0.875rem;
          font-style: italic;
          color: var(--color-muted);
          min-width: 1.75ch;
          flex-shrink: 0;
        }

        .mobile-nav-link {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw + 0.25rem, 2.75rem);
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--color-ink);
          text-decoration: none;
          transition: color var(--dur-fast) var(--ease),
                      letter-spacing var(--dur-fast) var(--ease);
          line-height: 1.1;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: var(--color-sabbia);
          letter-spacing: 0.01em;
        }

        /* CTA Prenota */
        .mobile-cta-full {
          display: block;
          text-align: center;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: var(--s-4) var(--s-10);
          background: var(--color-sabbia);
          color: var(--color-ink);
          border: 1px solid var(--color-sabbia);
          border-radius: var(--r-sm);
          transition: background var(--dur-fast) var(--ease),
                      color var(--dur-fast) var(--ease);
          text-decoration: none;
          margin: var(--s-6) 0 var(--s-8);
          width: 100%;
        }

        .mobile-cta-full:hover {
          background: transparent;
          color: var(--color-ink);
        }

        .mobile-cta-full.active {
          background: transparent;
          color: var(--color-ink);
        }

        /* Divider */
        .mob-divider {
          display: block;
          width: 48px;
          height: 1px;
          background: var(--color-sabbia);
          margin: 0 auto var(--s-6);
          transform-origin: left;
        }

        /* Contatti */
        .mobile-contacts {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--s-1);
          width: 100%;
        }

        .mob-contacts-label {
          margin-bottom: var(--s-2);
        }

        .mobile-contact-tel {
          display: block;
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--color-ink);
          text-decoration: none;
          transition: color var(--dur-fast) var(--ease);
          line-height: 1.5;
        }

        .mobile-contact-tel:hover,
        .mobile-contact-tel:active {
          color: var(--color-sabbia);
        }

        .mobile-contact-addr {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--color-muted);
          line-height: 1.65;
          font-style: normal;
          margin-top: var(--s-2);
        }

        .mobile-contact-hours {
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-muted);
          line-height: 1.65;
          margin-top: var(--s-1);
        }

        .mobile-contact-hours em {
          font-style: italic;
          opacity: 0.75;
        }

        /* ===== BREAKPOINTS ===== */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .mobile-menu { display: flex; }
        }

        /* ===== ENTRANCE ANIMATIONS ===== */
        @keyframes lineGrowLeft {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        @keyframes lineGrowRight {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        @keyframes fishPop {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes scriptReveal {
          from { opacity: 0; transform: translateY(8px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }

        .mobile-menu.open .mobile-lockup-taverna {
          animation: fadeUp 500ms var(--ease-out-expo) 250ms both;
        }

        .mobile-menu.open .mob-line-l {
          animation: lineGrowLeft 500ms ease-out 400ms both;
        }

        .mobile-menu.open .mob-line-r {
          animation: lineGrowRight 500ms ease-out 400ms both;
        }

        .mobile-menu.open .mob-fish {
          animation: fishPop 400ms ease-out 450ms both;
        }

        .mobile-menu.open .mobile-lockup-raphael {
          animation: scriptReveal 700ms var(--ease-out-expo) 500ms both;
        }

        .mobile-menu.open .mobile-nav-item:nth-child(1) {
          animation: fadeUp 500ms var(--ease-out-expo) 600ms both;
        }

        .mobile-menu.open .mobile-nav-item:nth-child(2) {
          animation: fadeUp 500ms var(--ease-out-expo) 720ms both;
        }

        .mobile-menu.open .mobile-nav-item:nth-child(3) {
          animation: fadeUp 500ms var(--ease-out-expo) 840ms both;
        }

        .mobile-menu.open .mobile-cta-full {
          animation: fadeUp 500ms var(--ease-out-expo) 960ms both;
        }

        .mobile-menu.open .mob-divider {
          animation: lineGrowRight 400ms ease-out 1080ms both;
        }

        .mobile-menu.open .mobile-contacts {
          animation: fadeUp 500ms var(--ease-out-expo) 1140ms both;
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .navbar { transition: none; }
          .hamburger-line { transition: transform 150ms linear, opacity 150ms linear; }
          .mobile-overlay { animation: none; }
          .mobile-menu {
            clip-path: none !important;
            transition: opacity 150ms linear;
            opacity: 0;
          }
          .mobile-menu.open {
            opacity: 1;
          }
          .mobile-menu *,
          .mobile-menu.open * {
            animation: none !important;
            filter: none !important;
          }
        }
      `}</style>
        </nav>
    );
}
