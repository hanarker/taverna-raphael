'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Correct hook for App Router
import Link from 'next/link';

export default function NewsDetailPage() {
    const { slug } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        async function fetchNewsDetail() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/news/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                }
            } catch (error) {
                console.error('Error fetching news detail:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNewsDetail();
    }, [slug]);

    if (loading) return <div className="loader container">Caricamento...</div>;
    if (!news) return <div className="loader container">Notizia non trovata <Link href="/news" style={{ color: 'var(--color-primary)' }}>Torna indietro</Link></div>;

    return (
        <article className="news-detail-container">
            <div className="news-hero" style={{ backgroundImage: `url(${news.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'})` }}>
                <div className="overlay"></div>
                <div className="hero-content container">
                    <h1>{news.title}</h1>
                    <span className="date" suppressHydrationWarning>{new Date(news.publishedAt).toLocaleDateString('it-IT')}</span>
                </div>
            </div>

            <div className="content container">
                <div className="body-text">
                    {news.content.split('\n').map((para, idx) => (
                        <p key={idx}>{para}</p>
                    ))}
                </div>
                <Link href="/news" className="back-link">&larr; Torna alle News</Link>
            </div>

            <style jsx>{`
        .loader {
            padding-top: var(--spacing-xl);
            text-align: center;
            min-height: 50vh;
        }

        .news-hero {
          height: 60vh;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding-bottom: 4rem;
        }

        .overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to top, var(--color-bg), transparent);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .date {
          color: var(--color-primary);
          font-size: 1.1rem;
        }

        .content {
          padding: 4rem var(--spacing-md);
          max-width: 800px;
        }

        .body-text p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--color-text);
        }

        .back-link {
            display: inline-block;
            margin-top: 2rem;
            color: var(--color-primary);
            border-bottom: 1px solid transparent;
        }
        
        .back-link:hover {
            border-bottom-color: var(--color-primary);
        }
      `}</style>
        </article>
    );
}
