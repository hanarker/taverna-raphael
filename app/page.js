'use client';

import Hero from './components/Hero';

export default function Home() {
  return (
    <>
      <Hero />
      <section className="section container">
        <div className="about-grid">
          <div className="about-text">
            <h2>La Nostra Storia</h2>
            <p>
              Benvenuti alla Taverna Raphael, dove tradizione marinara e innovazione si incontrano.
              Utilizziamo solo ingredienti freschi e di stagione per creare piatti che
              raccontano una storia di mare.
            </p>
            <p className="mt-4">
              Il nostro chef, con anni di esperienza internazionale, porta in tavola
              sapori unici che delizieranno il vostro palato.
            </p>
            <a href="/menu" className="btn mt-8">Scopri il Menu</a>
          </div>
          <div className="about-image">
            <div className="img-placeholder"></div>
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <h2 className="text-center">Piatti in Evidenza</h2>
          <div className="menu-grid">
            <div className="menu-item">
              <div className="menu-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80')" }}></div>
              <h3>Risotto allo Zafferano</h3>
              <p>Con ossobuco e gremolada</p>
              <span className="price">€24</span>
            </div>
            <div className="menu-item">
              <div className="menu-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80')" }}></div>
              <h3>Tagliata di Manzo</h3>
              <p>Rucola, grana e aceto balsamico</p>
              <span className="price">€28</span>
            </div>
            <div className="menu-item">
              <div className="menu-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80')" }}></div>
              <h3>Tiramisù Artigianale</h3>
              <p>La ricetta classica della nonna</p>
              <span className="price">€10</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bg-surface {
          background: rgba(40, 75, 120, 0.4);
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .about-text p {
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }

        .img-placeholder, .menu-img {
          width: 100%;
          border-radius: 4px;
        }

        .img-placeholder {
          height: 400px;
          background: url('https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') center/cover;
          border: 1px solid var(--text-white);
        }

        .mt-4 { margin-top: 1rem; }
        .mt-8 { margin-top: 2rem; display: inline-block; }
        .text-center { text-align: center; }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .menu-item {
          text-align: center;
          padding: 2rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .menu-item:hover {
            transform: translateY(-5px);
            border-color: var(--gold-accent);
        }

        .menu-img {
          height: 200px;
          margin-bottom: 1.5rem;
          background-size: cover;
          background-position: center;
          border: 1px solid var(--text-white);
        }

        .menu-item h3 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }

        .menu-item p {
            color: var(--color-text-muted);
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }

        .price {
          display: block;
          font-family: var(--font-heading);
          color: var(--gold-accent);
          font-size: 1.2rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
            .about-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </>
  );
}
