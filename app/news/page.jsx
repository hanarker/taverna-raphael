'use client';

import { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';

export default function NewsPage() {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/news`);
                if (res.ok) {
                    const data = await res.json();
                    setNewsList(data);
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    const SkeletonCard = () => (
        <div className="skeleton-card" aria-hidden="true">
            <div className="sk-img" />
            <div className="sk-body">
                <div className="sk-date" />
                <div className="sk-title" />
                <div className="sk-text" />
                <div className="sk-text sk-short" />
                <div className="sk-link" />
            </div>
        </div>
    );

    return (
        <>
            {/* Hero compatto */}
            <div className="page-hero">
                <div className="container page-hero-inner">
                    <span className="eyebrow">Novità e appuntamenti</span>
                    <h1>News</h1>
                    <div className="divider-line" aria-hidden="true" />
                </div>
            </div>

            <div className="section container">
                {loading ? (
                    <div className="news-grid" aria-busy="true" aria-label="Caricamento notizie">
                        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                    </div>
                ) : newsList.length > 0 ? (
                    <div className="news-grid">
                        {newsList.map((news) => <NewsCard key={news.id} news={news} />)}
                    </div>
                ) : (
                    <p className="empty-state">Nessuna notizia disponibile al momento.</p>
                )}
            </div>

            <style jsx>{`
        .page-hero {
          background: var(--color-panna);
          padding: calc(80px + var(--s-12)) 0 var(--s-12);
        }

        .page-hero-inner {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--s-2);
        }

        .page-hero-inner h1 {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1;
          margin: var(--s-2) 0 var(--s-4);
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--s-12) var(--s-8);
        }

        .empty-state {
          text-align: center;
          color: var(--color-muted);
          font-size: var(--fs-lead);
          padding: var(--s-16) 0;
        }

        /* Skeleton */
        @keyframes shimmer {
          0%   { opacity: 0.5; }
          50%  { opacity: 0.9; }
          100% { opacity: 0.5; }
        }

        .skeleton-card {
          animation: shimmer 1.6s ease-in-out infinite;
        }

        .sk-img {
          width: 100%;
          aspect-ratio: 16 / 10;
          background: var(--color-panna);
          border-radius: var(--r-sm);
          margin-bottom: var(--s-4);
        }

        .sk-body { display: flex; flex-direction: column; gap: var(--s-2); }
        .sk-date  { height: 10px; width: 90px; background: var(--color-line); border-radius: 2px; }
        .sk-title { height: 14px; width: 70%; background: var(--color-line); border-radius: 2px; }
        .sk-text  { height: 11px; width: 95%; background: var(--color-line); border-radius: 2px; }
        .sk-short { width: 60%; }
        .sk-link  { height: 10px; width: 50px; background: var(--color-sabbia-soft); border-radius: 2px; margin-top: var(--s-2); }

        @media (max-width: 1024px) {
          .news-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .news-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </>
    );
}
