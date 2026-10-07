'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewsDetailPage() {
    const { slug } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        async function fetchNewsDetail() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/news/${slug}`);
                if (res.ok) setNews(await res.json());
            } catch (error) {
                console.error('Error fetching news detail:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNewsDetail();
    }, [slug]);

    if (loading) return (
        <div className="loader">
            <div className="loader-inner container">
                <p>Caricamento…</p>
            </div>
        </div>
    );

    if (!news) return (
        <div className="loader">
            <div className="loader-inner container">
                <p>Notizia non trovata.</p>
                <Link href="/news" className="back-link">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                        <path d="M6 1L1 5l5 4M1 5h12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Torna alle News
                </Link>
            </div>
        </div>
    );

    const imgSrc = news.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80';
    const paragraphs = news.content.split('\n').filter(p => p.trim());

    return (
        <article>
            {/* Hero 60vh */}
            <div className="news-hero" style={{ backgroundImage: `url(${imgSrc})` }}>
                <div className="hero-overlay" aria-hidden="true" />
                <div className="hero-content container">
                    <span className="hero-date" suppressHydrationWarning>
                        {new Date(news.publishedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <h1>{news.title}</h1>
                </div>
            </div>

            {/* Corpo articolo */}
            <div className="article-content container">
                <div className="body-text">
                    {paragraphs.map((para, idx) => (
                        <p key={idx} className={idx === 0 ? 'dropcap' : ''}>{para}</p>
                    ))}
                </div>
                <div className="article-footer">
                    <Link href="/news" className="back-link">
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                            <path d="M6 1L1 5l5 4M1 5h12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Torna alle News
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .loader {
          min-height: 60vh;
          display: flex;
          align-items: center;
          padding-top: 80px;
        }

        .loader-inner {
          display: flex;
          flex-direction: column;
          gap: var(--s-4);
        }

        /* Hero */
        .news-hero {
          height: 60vh;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding-bottom: var(--s-12);
          padding-top: 80px;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top,
            var(--color-ink) 0%,
            rgba(13, 35, 43, 0.4) 50%,
            transparent 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .hero-date {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--color-text-soft);
          margin-bottom: var(--s-3);
        }

        h1 {
          font-size: clamp(2rem, 4vw, 4rem);
          color: var(--color-paper);
          line-height: 1.1;
          max-width: 800px;
          text-shadow: 0 2px 8px rgba(13, 35, 43, 0.4);
        }

        /* Article content */
        .article-content {
          padding: var(--s-16) var(--s-6);
          max-width: 760px;
        }

        .body-text p {
          margin-bottom: var(--s-6);
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--color-paper);
        }

        /* Drop cap sul primo paragrafo */
        .body-text .dropcap::first-letter {
          font-family: var(--font-display);
          font-size: 4.5rem;
          line-height: 0.85;
          float: left;
          padding: 0.3rem var(--s-3) 0 0;
          color: var(--color-brass-bright);
        }

        .article-footer {
          margin-top: var(--s-12);
          padding-top: var(--s-8);
          border-top: 1px solid var(--color-line);
        }

        .back-link {
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

        .back-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--color-brass-bright);
          transition: width var(--dur-base) var(--ease);
        }

        .back-link:hover::after { width: 100%; }

        @media (max-width: 768px) {
          .news-hero { height: 50vh; }
          h1 { font-size: clamp(1.75rem, 6vw, 2.5rem); }
        }
      `}</style>
        </article>
    );
}
