'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY = 'tr-intro-seen';

export default function IntroFade() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        setShow(true);
        sessionStorage.setItem(SESSION_KEY, '1');
      }
    } catch {
      // sessionStorage non disponibile (privacy mode): mostra comunque l'intro una volta
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="intro-fade" aria-hidden="true">
      <span>Taverna Raphael</span>

      <style jsx>{`
        .intro-fade {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: var(--color-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: intro-fade-out 1.4s ease forwards;
          pointer-events: none;
        }

        .intro-fade span {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.4rem;
          color: var(--color-brass-bright);
          opacity: 0;
          animation: intro-word 0.8s ease 0.1s forwards;
        }

        @keyframes intro-word {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }

        @keyframes intro-fade-out {
          0%   { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-fade { display: none; }
        }
      `}</style>
    </div>
  );
}
