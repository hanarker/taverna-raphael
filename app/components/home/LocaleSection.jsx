'use client';

import useRevealOnScroll from '../../hooks/useRevealOnScroll';
import CarouselHome from '../CarouselHome';

// Sezione nata dalla fusione di "Storia" e "Locale": il racconto della casa
// introduce direttamente il carosello del nuovo spazio.
export default function LocaleSection() {
  const [refHead, headVisible] = useRevealOnScroll();

  return (
    <section id="locale" className="section locale-section">
      <div ref={refHead} className={`container locale-head reveal${headVisible ? ' is-visible' : ''}`}>
        <span className="eyebrow">La casa</span>
        <h2>Dal 2015, la stessa regola.</h2>
        <p>Taverna Raphael nasce nel 2015 con un&apos;idea semplice: la tradizione del mare incontra la ricerca in cucina, senza che l&apos;una faccia mai ombra all&apos;altra.</p>
        <p>Lo chef Giacomo porta in tavola un patrimonio di viaggi ed esperienze, trasformando ogni piatto in un incontro di culture e tecniche diverse — sempre a partire da quello che il mare ha deciso di dare quel giorno.</p>
      </div>

      <CarouselHome />

      <style jsx>{`
        .locale-section {
          background: var(--color-ink);
          padding-bottom: 0;
        }

        .locale-head {
          margin-bottom: var(--s-8);
          max-width: 640px;
        }

        .locale-head h2 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin-bottom: var(--s-4);
        }

        .locale-head p {
          color: var(--color-text-soft);
          font-size: 0.96rem;
          margin-bottom: var(--s-3);
        }
      `}</style>
    </section>
  );
}
