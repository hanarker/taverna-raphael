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

    return (
        <div className="page-container container">
            <h1 className="page-title">Ultime Novità</h1>

            {loading ? (
                <p className="text-center">Caricamento...</p>
            ) : (
                <div className="news-grid">
                    {newsList.length > 0 ? (
                        newsList.map((news) => (
                            <NewsCard key={news.id} news={news} />
                        ))
                    ) : (
                        <p className="text-center">Nessuna notizia disponibile al momento.</p>
                    )}
                </div>
            )}

            <style jsx>{`
        .page-container {
          padding-top: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
          min-height: 80vh;
        }

        .page-title {
          text-align: center;
          font-size: 3rem;
          margin-bottom: var(--spacing-lg);
          color: var(--color-primary);
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .text-center {
          text-align: center;
          color: var(--color-text-muted);
        }
      `}</style>
        </div>
    );
}
