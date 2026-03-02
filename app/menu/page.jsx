'use client';

import { useState, useEffect } from 'react';

function FishBullet() {
  return (
    <svg
      className="fish-bullet"
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="#E7C697"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M18 6C15 1 10 0 6 0 2.5 0 0 3 0 6c0 3 2.5 6 6 6 4 0 9-1 12-6z" />
      <circle cx="13.5" cy="4.5" r="1" fill="var(--bg-blue)" />
      <path d="M0 3 C-1 6 -1 6 0 9" stroke="#E7C697" strokeWidth="1" fill="none" />
    </svg>
  );
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Antipasti', 'Primi', 'Secondi', 'Dolci', 'Vini', 'Bevande'];
  const allergenIcons = {
    'Glutine': '🌾',
    'Latte': '🥛',
    'Uova': '🥚',
    'Frutta a guscio': '🥜',
    'Pesce': '🐟',
    'Crostacei': '🦐',
    'Soia': '🫘',
    'Vegetariano': '🥬',
    'Piccante': '🌶️'
  };

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

  if (loading) return <div className="page-container container text-center">Caricamento menu...</div>;

  return (
    <div className="page-container container">
      <h1 className="page-title">Il Nostro Menu</h1>

      <div className="menu-sections">
        {categories.map((category) => {
          const items = menuItems.filter(item => item.category === category && item.available);
          if (items.length === 0) return null;

          return (
            <div key={category} className="menu-category">
              <h2>🐟 {category} 🐟</h2>
              <ul className="menu-list">
                {items.map((item) => (
                  <li key={item.id} className="menu-list-item">
                    <FishBullet />
                    <div className="item-content">
                      <div className="item-header">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">€ {item.price}</span>
                      </div>
                      <p className="item-desc">{item.description}</p>
                      <div className="item-allergens">
                        {item.allergens && item.allergens.map(a => (
                          <span key={a} title={a} className="allergen-icon">{allergenIcons[a] || '⚠️'}</span>
                        ))}
                      </div>
                    </div>
                    {item.imageUrl && (
                      <div className="item-image" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .page-container {
          padding-top: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
          min-height: 80vh;
        }

        .text-center { text-align: center; color: var(--color-text-muted); }

        .page-title {
          text-align: center;
          font-size: 3rem;
          margin-bottom: var(--spacing-lg);
          color: var(--gold-accent);
        }

        .menu-category {
          margin-bottom: 4rem;
        }

        .menu-category h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
          border-bottom: 1px solid var(--gold-accent);
          padding-bottom: 1rem;
          display: inline-block;
          width: 100%;
          color: var(--gold-accent);
        }

        .menu-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .menu-list-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          background: var(--color-surface);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          transition: border-color 0.3s;
        }

        .menu-list-item :global(.fish-bullet) {
          flex-shrink: 0;
          margin-top: 0.35rem;
        }

        .menu-list-item:hover {
            border-color: var(--gold-accent);
        }

        .item-content {
            flex: 1;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.5rem;
          border-bottom: 1px dotted var(--color-border);
          padding-bottom: 0.5rem;
        }

        .item-name {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-text);
        }

        .item-price {
          color: var(--gold-accent);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .item-desc {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          font-style: italic;
          margin-bottom: 0.5rem;
        }

        .item-allergens {
            display: flex;
            gap: 0.5rem;
            font-size: 1.2rem;
        }

        .allergen-icon { cursor: help; }

        .item-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            background-size: cover;
            background-position: center;
            flex-shrink: 0;
            border: 1px solid var(--text-white);
        }
      `}</style>
    </div>
  );
}
