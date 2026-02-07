'use client';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Ristorante Elegante</h1>
        <p>Sapori autentici, atmosfera unica.</p>
        <a href="/prenotazioni" className="btn-hero">Prenota un tavolo</a>
      </div>
      <style jsx>{`
        .hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }

        .hero-content {
          animation: fadeUp 1s ease-out;
        }

        h1 {
          font-size: 4rem;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          color: #fff;
        }

        p {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          color: #ddd;
        }

        .btn-hero {
          display: inline-block;
          padding: 1rem 3rem;
          background: var(--color-primary);
          color: var(--color-bg);
          font-family: var(--font-heading);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          border: 2px solid var(--color-primary);
          transition: all 0.3s ease;
        }

        .btn-hero:hover {
          background: transparent;
          color: var(--color-primary);
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
          h1 {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}
