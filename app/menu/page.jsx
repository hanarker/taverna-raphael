'use client';

import { useState, useEffect } from 'react';

function CategoryOrnament() {
  return (
    <div className="cat-ornament" aria-hidden="true">
      <span className="cat-orn-line" />
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 7C16 7 11 1.5 3 1.5C3 1.5 6.5 7 3 12.5C11 12.5 16 7 16 7Z" stroke="currentColor" strokeWidth="1" fill="none"/>
        <path d="M18 4L22 7L18 10" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="5.5" cy="6.5" r="0.75" fill="currentColor"/>
      </svg>
      <span className="cat-orn-line" />
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="skeleton-wrapper" aria-busy="true" aria-label="Caricamento menu in corso">
      {[1, 2].map((cat) => (
        <div key={cat} className="skeleton-category">
          <div className="sk-cat-title" />
          <div className="sk-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="sk-item">
                <div className="sk-name" />
                <div className="sk-dots" />
                <div className="sk-price" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        .skeleton-category { margin-bottom: var(--s-16); animation: shimmer 1.6s ease-in-out infinite; }
        .sk-cat-title { height: 1.5rem; width: 120px; background: var(--color-panna); border-radius: 2px; margin: 0 auto var(--s-8); }
        .sk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4) var(--s-8); }
        .sk-item { display: flex; gap: var(--s-2); align-items: center; padding: var(--s-4) 0; border-bottom: 1px solid var(--color-line); }
        .sk-name { height: 12px; width: 40%; background: var(--color-panna); border-radius: 2px; }
        .sk-dots { flex: 1; height: 1px; background: var(--color-panna); }
        .sk-price { height: 12px; width: 30px; background: var(--color-sabbia-soft); border-radius: 2px; }
      `}</style>
    </div>
  );
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Antipasti', 'Primi', 'Secondi', 'Dolci', 'Vini', 'Bevande'];

  useEffect(() => {
    async function fetchMenu() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/api/menu`);
        if (res.ok) {
          const data = await res.json();
          setMenuItems(data);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  return (
    <>
      {/* Hero compatto */}
      <div className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">Cucina di mare stagionale</span>
          <h1>Il Menu</h1>
          <span className="hero-script" aria-hidden="true">stagionale</span>
          <div className="divider-line divider-line--center" style={{ marginTop: 'var(--s-4)' }} aria-hidden="true" />
        </div>
      </div>

      <div className="section container">
        {loading ? (
          <MenuSkeleton />
        ) : (
          <div className="menu-sections">
            {categories.map((category, catIdx) => {
              const items = menuItems.filter(item => item.category === category && item.available);
              if (items.length === 0) return null;

              return (
                <div key={category} className="menu-category">
                  {catIdx > 0 && <CategoryOrnament />}
                  <div className="category-header">
                    <span className="eyebrow">{String(catIdx + 1).padStart(2, '0')}</span>
                    <h2>{category}</h2>
                    <div className="divider-line" aria-hidden="true" />
                  </div>
                  <ul className="menu-list" aria-label={`Piatti: ${category}`}>
                    {items.map((item) => (
                      <li key={item.id} className="menu-item">
                        <div className="item-row">
                          <span className="item-name">{item.name}</span>
                          <span className="item-dots" aria-hidden="true" />
                          <span className="item-price">€ {item.price}</span>
                        </div>
                        {item.description && (
                          <p className="item-desc">{item.description}</p>
                        )}
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="item-allergens" aria-label="Allergeni">
                            {item.allergens.map(a => (
                              <span key={a} className="allergen-badge">{a}</span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        /* Hero */
        .page-hero {
          background: var(--color-panna);
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

        .hero-script {
          font-family: var(--font-script);
          font-size: clamp(2rem, 4vw, 3rem);
          color: var(--color-sabbia);
          display: block;
          margin-top: -0.2em;
          line-height: 1.3;
        }

        /* Category ornament */
        :global(.cat-ornament) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--s-4);
          color: var(--color-sabbia);
          margin: var(--s-12) 0;
        }

        :global(.cat-orn-line) {
          display: block;
          width: 48px;
          height: 1px;
          background: var(--color-sabbia);
        }

        /* Category */
        .category-header {
          margin-bottom: var(--s-8);
        }

        .category-header h2 {
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          color: var(--color-ink);
          margin-top: var(--s-2);
          margin-bottom: var(--s-4);
        }

        /* List */
        .menu-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0 var(--s-16);
        }

        .menu-item {
          padding: var(--s-4) 0;
          border-bottom: 1px solid var(--color-line);
        }

        .item-row {
          display: flex;
          align-items: baseline;
          gap: var(--s-2);
          margin-bottom: var(--s-1);
        }

        .item-name {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--color-ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60%;
        }

        .item-dots {
          flex: 1;
          min-width: var(--s-4);
          border-bottom: 1px dotted var(--color-line-strong);
          margin-bottom: 4px;
        }

        .item-price {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--color-sabbia);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .item-desc {
          font-size: 0.875rem;
          color: var(--color-muted);
          font-style: italic;
          line-height: 1.5;
          margin: 0;
        }

        .item-allergens {
          display: flex;
          flex-wrap: wrap;
          gap: var(--s-1);
          margin-top: var(--s-2);
        }

        .allergen-badge {
          display: inline-block;
          padding: 0.1rem 0.4rem;
          border: 1px solid var(--color-sabbia);
          color: var(--color-muted);
          font-family: var(--font-body);
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-radius: var(--r-sm);
        }

        @media (max-width: 768px) {
          .menu-list { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
