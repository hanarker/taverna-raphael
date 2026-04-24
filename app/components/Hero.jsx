'use client';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <span className="eyebrow anim-eyebrow">Dal 1987 · Cucina di mare</span>
        <h1>
          <span className="h1-display anim-taverna">Taverna</span>
          <span className="ornament">
            <span className="ornament-line ornament-line--left anim-line-left" aria-hidden="true" />
            <svg className="ornament-fish anim-fish" width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 7C16 7 11 1.5 3 1.5C3 1.5 6.5 7 3 12.5C11 12.5 16 7 16 7Z" stroke="currentColor" strokeWidth="1" fill="none"/>
              <path d="M18 4L22 7L18 10" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5.5" cy="6.5" r="0.75" fill="currentColor"/>
            </svg>
            <span className="ornament-line ornament-line--right anim-line-right" aria-hidden="true" />
          </span>
          <span className="h1-script anim-raphael">Raphael</span>
        </h1>
        <p className="hero-subtitle anim-subtitle">Delizie di mare, racconto autentico.<br />Una tavola sul golfo di Napoli.</p>
        <div className="hero-cta anim-cta">
          <a href="/prenotazioni" className="btn">Prenota un tavolo</a>
          <a href="/menu" className="btn btn-ghost">Scopri il menu</a>
        </div>
      </div>

      <div className="hero-media anim-media">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
          alt="Ambiente della Taverna Raphael"
          className="hero-img anim-kenburns"
          loading="eager"
        />
        <div className="hero-media-overlay" aria-hidden="true" />
      </div>

      <style jsx>{`
        .hero {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 60fr 40fr;
          align-items: stretch;
        }

        .hero-text {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: var(--s-24) var(--s-16) var(--s-24) 0;
          padding-top: calc(80px + var(--s-8));
          padding-bottom: var(--s-24);
          padding-left: max(var(--s-6), calc((100vw - 1180px) / 2 + var(--s-6)));
        }

        h1 {
          display: flex;
          flex-direction: column;
          margin-bottom: var(--s-6);
        }

        .h1-display {
          font-family: var(--font-display);
          font-size: clamp(4rem, 6vw, 7rem);
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--color-ink);
        }

        .ornament {
          display: flex;
          align-items: center;
          gap: var(--s-3);
          margin: var(--s-2) 0;
        }

        .ornament-line {
          flex: 0 0 40px;
          height: 1px;
          background: var(--color-sabbia);
          transform-origin: left;
        }

        .ornament-line--right {
          transform-origin: right;
        }

        .ornament-fish {
          color: var(--color-sabbia);
          flex-shrink: 0;
        }

        .h1-script {
          font-family: var(--font-script);
          font-size: clamp(3.5rem, 5vw, 6rem);
          color: var(--color-sabbia);
          line-height: 1.05;
          margin-top: -0.15em;
        }

        .hero-subtitle {
          font-size: var(--fs-lead);
          color: var(--color-muted);
          line-height: 1.7;
          margin-bottom: var(--s-8);
          max-width: 42ch;
        }

        .hero-cta {
          display: flex;
          gap: var(--s-4);
          flex-wrap: wrap;
        }

        /* Media side */
        .hero-media {
          position: relative;
          overflow: hidden;
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform var(--dur-slow) var(--ease);
        }

        .hero-media:hover .hero-img {
          transform: scale(1.02);
        }

        .hero-media-overlay {
          position: absolute;
          inset: 0;
          background: rgba(223, 185, 136, 0.06);
          pointer-events: none;
        }

        /* ---- Entrance animations ---- */

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroFadeUpBig {
          from { opacity: 0; transform: translateY(18px); letter-spacing: -0.04em; }
          to   { opacity: 1; transform: translateY(0);    letter-spacing: -0.02em; }
        }

        @keyframes lineGrowLeft {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        @keyframes lineGrowRight {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        @keyframes fishPop {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes scriptReveal {
          from { opacity: 0; transform: translateY(8px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }

        @keyframes mediaClipReveal {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }

        @keyframes kenBurns {
          from { transform: scale(1.08); }
          to   { transform: scale(1.0); }
        }

        .anim-eyebrow {
          animation: heroFadeUp 500ms var(--ease) 100ms both;
        }

        .anim-taverna {
          animation: heroFadeUpBig 700ms var(--ease) 250ms both;
        }

        .anim-line-left {
          animation: lineGrowLeft 450ms ease-out 500ms both;
        }

        .anim-line-right {
          animation: lineGrowRight 450ms ease-out 500ms both;
        }

        .anim-fish {
          animation: fishPop 400ms ease-out 650ms both;
        }

        .anim-raphael {
          animation: scriptReveal 900ms var(--ease-out-expo) 750ms both;
        }

        .anim-subtitle {
          animation: heroFadeUp 500ms var(--ease) 1050ms both;
        }

        .anim-cta {
          animation: heroFadeUp 500ms var(--ease) 1200ms both;
        }

        .anim-media {
          animation: mediaClipReveal 1000ms var(--ease-out-expo) 300ms both;
        }

        .anim-kenburns {
          animation: kenBurns 1800ms ease-out 300ms both,
                     none; /* hover scale via transition class, not override */
        }

        /* override hover scale during ken burns — after animation completes, transition takes over */
        .hero-media:hover .anim-kenburns {
          animation: none;
          transform: scale(1.02);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .anim-eyebrow,
          .anim-taverna,
          .anim-line-left,
          .anim-line-right,
          .anim-fish,
          .anim-raphael,
          .anim-subtitle,
          .anim-cta,
          .anim-media,
          .anim-kenburns {
            animation: none;
            opacity: 1;
            transform: none;
            clip-path: none;
            filter: none;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero {
            grid-template-columns: 1fr;
            grid-template-rows: 45vh auto;
            padding-top: 0;
          }

          .hero-media {
            order: -1;
          }

          .hero-text {
            padding: var(--s-12) var(--s-6);
          }

          .h1-display {
            font-size: clamp(3rem, 10vw, 4.5rem);
          }

          .h1-script {
            font-size: clamp(2.8rem, 9vw, 4rem);
          }
        }

        @media (max-width: 480px) {
          .hero-cta {
            flex-direction: column;
          }
          .hero-cta .btn {
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
