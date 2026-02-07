'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <Link href="/" className="logo">
                    RISTORANTE
                </Link>
                <div className="nav-links">
                    <Link href="/">Home</Link>
                    <Link href="/menu">Menu</Link>
                    <Link href="/news">News</Link>
                    <Link href="/prenotazioni" className="btn-nav">Prenota</Link>
                </div>
            </div>
            <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 2rem 0;
          transition: all 0.3s ease;
          background: transparent;
        }

        .navbar.scrolled {
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(10px);
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--color-primary);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-links a {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
        }

        .nav-links a:hover {
          opacity: 1;
          color: var(--color-primary);
        }

        .btn-nav {
          border: 1px solid var(--color-primary);
          padding: 0.5rem 1.5rem;
          color: var(--color-primary) !important;
          transition: all 0.3s ease;
        }

        .btn-nav:hover {
          background: var(--color-primary);
          color: var(--color-bg) !important;
        }
      `}</style>
        </nav>
    );
}
