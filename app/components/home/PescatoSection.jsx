'use client';

import Link from 'next/link';
import useRevealOnScroll from '../../hooks/useRevealOnScroll';
import { MENU_CATEGORIES, MENU_NOTE } from '../../data/menu';
import DishRow from './DishRow';

export default function PescatoSection() {
  const [refHead, headVisible] = useRevealOnScroll();
  const [refCol1, col1Visible] = useRevealOnScroll();
  const [refCol2, col2Visible] = useRevealOnScroll();
  const [refNote, noteVisible] = useRevealOnScroll();

  const columnOne = MENU_CATEGORIES.filter((c) => c.column === 1);
  const columnTwo = MENU_CATEGORIES.filter((c) => c.column === 2);

  return (
    <section id="pescato" className="section pescato-section">
      <div className="container menu-wrap">
        <div ref={refHead} className={`menu-head reveal${headVisible ? ' is-visible' : ''}`}>
          <span className="eyebrow eyebrow-center">Aggiornato ogni mattina</span>
          <h2>Il pescato del giorno</h2>
        </div>

        <div className="menu-cols">
          <div ref={refCol1} className={`reveal${col1Visible ? ' is-visible' : ''}`}>
            {columnOne.map((cat) => (
              <div className="menu-cat" key={cat.id}>
                <h3>{cat.title}</h3>
                {cat.dishes.map((dish) => (
                  <DishRow dish={dish} key={dish.name} />
                ))}
              </div>
            ))}
          </div>

          <div ref={refCol2} className={`reveal${col2Visible ? ' is-visible' : ''}`}>
            {columnTwo.map((cat) => (
              <div className="menu-cat" key={cat.id}>
                <h3>{cat.title}</h3>
                {cat.dishes.map((dish) => (
                  <DishRow dish={dish} key={dish.name} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <p ref={refNote} className={`menu-note reveal${noteVisible ? ' is-visible' : ''}`}>{MENU_NOTE}</p>

        <div className="menu-cta">
          <Link href="/menu" className="btn-ghost">Consulta il menu completo in PDF</Link>
        </div>
      </div>

      <style jsx>{`
        .pescato-section {
          background: var(--color-ink);
        }

        .menu-wrap {
          max-width: 920px;
        }

        .menu-head {
          text-align: center;
          margin-bottom: var(--s-16);
        }

        .menu-head h2 {
          font-size: clamp(2.1rem, 4vw, 3.2rem);
        }

        .eyebrow-center {
          justify-content: center;
        }

        .menu-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--s-16);
        }

        .menu-cat {
          margin-bottom: var(--s-12);
        }

        .menu-cat h3 {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-brass-bright);
          margin-bottom: var(--s-6);
          font-weight: 500;
        }

        .menu-note {
          max-width: 640px;
          margin: var(--s-16) auto 0;
          text-align: center;
          font-size: 0.76rem;
          line-height: 1.7;
          color: var(--color-text-dim);
          opacity: 0.75;
        }

        .menu-cta {
          text-align: center;
          margin-top: var(--s-12);
        }

        @media (max-width: 860px) {
          .menu-cols {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
