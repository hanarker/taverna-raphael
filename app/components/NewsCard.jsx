'use client';

import Link from 'next/link';

export default function NewsCard({ news }) {
  return (
    <div className="news-card">
      <div className="news-img" style={{ backgroundImage: `url(${news.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})` }}></div>
      <div className="news-content">
        <span className="news-date" suppressHydrationWarning>{new Date(news.publishedAt).toLocaleDateString('it-IT')}</span>
        <h3>{news.title}</h3>
        <p>{news.content.substring(0, 100)}...</p>
        <Link href={`/news/${news.slug}`} className="read-more">Leggi tutto &rarr;</Link>
      </div>
      <style jsx>{`
        .news-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .news-card:hover {
          transform: translateY(-5px);
          border-color: var(--gold-accent);
        }

        .news-img {
          height: 200px;
          background-size: cover;
          background-position: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .news-content {
          padding: 1.5rem;
        }

        .news-date {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          display: block;
          margin-bottom: 0.5rem;
        }

        h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        p {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .read-more {
          color: var(--gold-accent);
          font-weight: 600;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
