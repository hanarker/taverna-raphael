'use client';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          <span className="hero-taverna">Taverna</span>
          <span className="hero-raphael">Raphael</span>
        </h1>
        <p>Sapori di mare autentici, atmosfera unica.</p>
        <a href="/prenotazioni" className="btn-hero">Prenota un tavolo</a>
      </div>
      <style jsx>{`
        .hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(rgba(50, 90, 140, 0.55), rgba(50, 90, 140, 0.55)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }

        .hero-content {
          animation: fadeUp 1s ease-out;
        }

        h1 {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .hero-taverna {
          font-family: var(--font-heading);
          font-size: 3rem;
          text-transform: uppercase;
          letter-spacing: 6px;
          color: var(--text-white);
          display: block;
        }

        .hero-raphael {
          font-family: var(--font-accent);
          font-size: 5rem;
          color: var(--gold-accent);
          text-transform: none;
          letter-spacing: 0;
          display: block;
          line-height: 1.1;
        }

        p {
          font-size: 1.3rem;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .btn-hero {
          display: inline-block;
          padding: 1rem 3rem;
          background: var(--gold-accent);
          color: var(--bg-blue);
          font-family: var(--font-heading);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          border: 2px solid var(--gold-accent);
          transition: all 0.3s ease;
        }

        .btn-hero:hover {
          background: transparent;
          color: var(--text-white);
          border-color: var(--text-white);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .hero-taverna {
            font-size: 2rem;
            letter-spacing: 4px;
          }
          .hero-raphael {
            font-size: 3.5rem;
          }
        }
      `}</style>
    </section>
  );
}
