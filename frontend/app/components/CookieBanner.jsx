'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
    const [isMounted, setIsMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!localStorage.getItem('cookieConsent')) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setVisible(false);
    };

    if (!isMounted || !visible) return null;

    return (
        <div className="cookie-banner" role="region" aria-label="Informativa sui cookie">
            <div className="cookie-inner container">
                <p className="cookie-text">
                    Utilizziamo cookie tecnici per garantire il corretto funzionamento del sito.
                    Nessun dato viene condiviso con terze parti a fini pubblicitari.{' '}
                    <Link href="/cookie-policy" className="cookie-link">Leggi la Cookie Policy</Link>
                </p>
                <div className="cookie-actions">
                    <button className="btn-decline" onClick={decline}>Solo necessari</button>
                    <button className="btn-accept" onClick={accept}>Accetta</button>
                </div>
            </div>

            <style jsx>{`
                .cookie-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    z-index: 2000;
                    background: var(--color-ink-light);
                    border-top: 1px solid var(--color-line-strong);
                    box-shadow: var(--shadow-banner);
                    padding: var(--s-4) 0;
                    animation: slideUp var(--dur-base) var(--ease) both;
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cookie-banner { animation: none; }
                }

                .cookie-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--s-8);
                }

                .cookie-text {
                    font-size: 0.9rem;
                    color: var(--color-text-soft);
                    line-height: 1.5;
                    margin: 0;
                }

                .cookie-link {
                    color: var(--color-paper);
                    text-decoration: underline;
                    text-decoration-color: var(--color-brass-bright);
                    text-underline-offset: 3px;
                    font-weight: 500;
                }

                .cookie-link:hover {
                    color: var(--color-brass-bright);
                }

                .cookie-actions {
                    display: flex;
                    gap: var(--s-3);
                    flex-shrink: 0;
                }

                .btn-accept {
                    padding: 0.55rem 1.5rem;
                    background: var(--color-brass);
                    color: var(--color-ink);
                    border: 1px solid var(--color-brass);
                    border-radius: var(--r-sm);
                    font-family: var(--font-body);
                    font-size: 0.8125rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    cursor: pointer;
                    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
                }

                .btn-accept:hover {
                    background: var(--color-brass-bright);
                    color: var(--color-ink);
                }

                .btn-decline {
                    padding: 0.55rem 1.25rem;
                    background: transparent;
                    color: var(--color-text-soft);
                    border: 1px solid var(--color-line-strong);
                    border-radius: var(--r-sm);
                    font-family: var(--font-body);
                    font-size: 0.8125rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    cursor: pointer;
                    transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
                }

                .btn-decline:hover {
                    color: var(--color-paper);
                    border-color: var(--color-brass);
                }

                @media (max-width: 700px) {
                    .cookie-inner {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: var(--s-4);
                    }
                    .cookie-actions { width: 100%; }
                    .btn-accept, .btn-decline { flex: 1; text-align: center; }
                }
            `}</style>
        </div>
    );
}
