'use client';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="eyebrow anim-eyebrow">Cucina di mare · dal 2015</span>
        <h1 className="anim-title">
          Taverna Raphael,<br /><em>fatti</em>, no storie.
        </h1>
        <p className="anim-subtitle">Una taverna dove il pescato del giorno decide il menù, non il contrario.</p>
        <div className="hero-actions anim-cta">
          <a href="#prenota" className="btn">Prenota un tavolo</a>
          <a href="#pescato" className="btn-ghost-link">Guarda il pescato di oggi</a>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span>scorri</span>
        <span className="line" />
      </div>

      <style jsx>{`
        .hero {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 6vw;
          position: relative;
          background-image:
            linear-gradient(180deg, rgba(13, 35, 43, 0.55) 0%, rgba(13, 35, 43, 0.32) 45%, rgba(13, 35, 43, 0.72) 100%),
            url('/vetrina/hero.jpg');
          background-size: cover;
          background-position: center 30%;
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 760px;
        }

        .hero-inner h1 {
          font-size: clamp(3rem, 8vw, 6.2rem);
          line-height: 0.98;
          font-style: italic;
          font-weight: 500;
          color: var(--color-paper);
        }

        .hero-inner h1 em {
          color: var(--color-brass-bright);
          font-style: italic;
        }

        .hero-inner p {
          margin-top: var(--s-8);
          font-size: 1.15rem;
          color: var(--color-text-soft);
          max-width: 480px;
        }

        .hero-actions {
          display: flex;
          gap: var(--s-6);
          margin-top: var(--s-12);
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-ghost-link {
          color: var(--color-text-soft);
          font-size: 0.85rem;
          border-bottom: 1px solid var(--color-text-dim);
          padding-bottom: 3px;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }

        .btn-ghost-link:hover {
          color: var(--color-paper);
          border-color: var(--color-brass-bright);
        }

        .scroll-cue {
          position: absolute;
          bottom: var(--s-8);
          left: 6vw;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-text-dim);
          display: flex;
          flex-direction: column;
          gap: var(--s-3);
          align-items: center;
        }

        .scroll-cue .line {
          width: 1px;
          height: 46px;
          background: linear-gradient(var(--color-brass-bright), transparent);
          animation: pulse-line 2.2s ease-in-out infinite;
        }

        @keyframes pulse-line {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* ---- Entrance animations ---- */
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-eyebrow {
          animation: heroFadeUp 500ms var(--ease) 100ms both;
        }

        .anim-title {
          animation: heroFadeUp 700ms var(--ease) 250ms both;
        }

        .anim-subtitle {
          animation: heroFadeUp 500ms var(--ease) 500ms both;
        }

        .anim-cta {
          animation: heroFadeUp 500ms var(--ease) 700ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-eyebrow, .anim-title, .anim-subtitle, .anim-cta {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .scroll-cue .line {
            animation: none;
          }
        }

        @media (max-width: 640px) {
          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
