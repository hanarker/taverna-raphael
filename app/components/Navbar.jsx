'use client';

import Link from 'next/link';
import Image from 'next/image';
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
                    <Image
                        src="/logo.png"
                        alt="Taverna Raphael"
                        width={130}
                        height={65}
                        className="logo-img"
                        priority
                    />
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
          padding: 0.5rem 0;
          transition: all 0.3s ease;
          background: transparent;
        }

        .navbar.scrolled {
          background: var(--color-surface-dark);
          backdrop-filter: blur(10px);
          padding: 0.4rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .logo-img {
          display: block;
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
          color: var(--gold-accent);
          transition: color 0.3s ease;
        }

        .nav-links a:hover {
          color: var(--text-white);
        }

        .btn-nav {
          border: 1px solid var(--gold-accent);
          padding: 0.5rem 1.5rem;
          color: var(--gold-accent) !important;
          transition: all 0.3s ease;
        }

        .btn-nav:hover {
          background: var(--gold-accent);
          color: var(--bg-blue) !important;
        }
      `}</style>
        </nav>
    );
}
