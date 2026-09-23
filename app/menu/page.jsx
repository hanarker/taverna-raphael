'use client';

import { useState, useEffect } from 'react';
export default function MenuPage() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${API_URL}/api/menu`);
        if (res.ok) {
          const data = await res.json();
          setMenuData(data);
        } else {
          setError('Errore nel caricamento del menu');
        }
      } catch (err) {
        setError('Errore di connessione');
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [API_URL]);

  const getMenuUrl = () => {
    if (!menuData?.pdfUrl) return null;
    return `${API_URL}${menuData.pdfUrl}`;
  };

  const menuUrl = getMenuUrl();

  return (
    <>
      <div className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">Il nostro menu</span>
          <h1>Il Menu</h1>
          <div className="divider-line divider-line--center" style={{ marginTop: 'var(--s-4)' }} aria-hidden="true" />
        </div>
      </div>

      <div className="section container">
        {loading ? (
          <div className="loading">Caricamento menu...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : !menuUrl ? (
          <div className="no-menu">
            <p>Menu non ancora disponibile.</p>
            <p className="hint">Contatta il ristorante per informazioni.</p>
          </div>
        ) : (
          <div className="pdf-wrapper">
            <div className="pdf-desktop">
              <iframe
                src={`${menuUrl}#view=FitH`}
                title="Menu del ristorante"
                className="pdf-frame"
              />
            </div>
            <div className="pdf-download">
              <p className="pdf-download-hint">Scarica il menu in PDF per visualizzarlo.</p>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn">
                Scarica il menu
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-hero {
          background: var(--color-ink-light);
          padding: calc(80px + var(--s-12)) 0 var(--s-12);
          text-align: center;
        }

        .page-hero-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .page-hero-inner h1 {
          font-size: clamp(3rem, 6vw, 4.5rem);
          line-height: 1;
          margin: var(--s-2) 0 0;
        }

        .pdf-wrapper {
          width: 100%;
        }

        .pdf-desktop {
          display: none;
        }

        .pdf-frame {
          width: 100%;
          height: 80vh;
          min-height: 500px;
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-md);
          background: var(--color-ink-light);
        }

        .pdf-download {
          text-align: center;
          padding: var(--s-8) var(--s-4);
        }

        .pdf-download-hint {
          color: var(--color-text-soft);
          margin-bottom: var(--s-4);
        }

        .loading, .error, .no-menu {
          text-align: center;
          padding: var(--s-12) var(--s-4);
          color: var(--color-text-soft);
        }

        .error {
          color: var(--color-danger);
        }

        .hint {
          font-size: 0.875rem;
          margin-top: var(--s-2);
        }

        @media (min-width: 768px) {
          .pdf-desktop {
            display: block;
          }

          .pdf-download-hint {
            display: none;
          }
        }
      `}</style>
    </>
  );
}