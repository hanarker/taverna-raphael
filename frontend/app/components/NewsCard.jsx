'use client';

import Link from 'next/link';

export default function NewsCard({ news }) {
  const imgSrc = news.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

  return (
    <Link href={`/news/${news.slug}`} className="news-card" aria-label={`Leggi: ${news.title}`}>
      <div className="card-media">
        <img
          src={imgSrc}
          alt={news.title}
          className="card-img"
          loading="lazy"
        />
      </div>
      <div className="card-body">
        <span className="news-date" suppressHydrationWarning>
          {new Date(news.publishedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <h3 className="news-title">{news.title}</h3>
        <p className="news-excerpt">{news.content.substring(0, 120)}…</p>
        <span className="read-link">
          Leggi
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M8 1l5 4-5 4M1 5h12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      <style jsx>{`
        .news-card {
          display: block;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }

        .card-media {
          overflow: hidden;
          aspect-ratio: 16 / 10;
          border-radius: var(--r-sm);
          margin-bottom: var(--s-4);
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform var(--dur-base) var(--ease);
        }

        .news-card:hover .card-img {
          transform: scale(1.03);
        }

        .card-body {
          padding: 0;
        }

        .news-date {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--color-text-dim);
          margin-bottom: var(--s-2);
        }

        .news-title {
          font-family: var(--font-display);
          font-size: var(--fs-h3);
          font-weight: 500;
          color: var(--color-paper);
          line-height: 1.3;
          margin-bottom: var(--s-3);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-excerpt {
          font-size: 0.9375rem;
          color: var(--color-text-soft);
          line-height: 1.6;
          margin-bottom: var(--s-4);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-link {
          display: inline-flex;
          align-items: center;
          gap: var(--s-2);
          font-family: var(--font-mono);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--color-brass-bright);
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
        }

        .read-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--color-brass-bright);
          transition: width var(--dur-base) var(--ease);
        }

        .news-card:hover .read-link::after {
          width: 100%;
        }
      `}</style>
    </Link>
  );
}
