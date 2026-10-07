'use client';

import { useState, useEffect, useCallback } from 'react';

const BREAKPOINTS = { lg: 1024, sm: 640 };

function getVisibleCount() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth >= BREAKPOINTS.lg) return 3;
  if (window.innerWidth >= BREAKPOINTS.sm) return 2;
  return 1;
}

export default function CarouselHome() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch(`${API_URL}/api/carousel`);
        if (res.ok) {
          const data = await res.json();
          setImages(data);
        }
      } catch (err) {
        console.error('Error fetching carousel:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, [API_URL]);

  const maxIndex = Math.max(0, images.length - visibleCount);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (images.length <= visibleCount) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      if (!isHovered) nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length, visibleCount, isHovered, nextSlide]);

  if (loading) {
    return (
      <div className="carousel-skeleton">
        <style jsx>{`
          .carousel-skeleton {
            width: 100%;
            height: 480px;
            background: var(--color-ink-light);
            animation: shimmer 1.6s ease-in-out infinite;
          }
          @keyframes shimmer {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="carousel-empty">
        <style jsx>{`
          .carousel-empty {
            width: 100%;
            height: 480px;
            background: var(--color-ink-light);
          }
        `}</style>
      </div>
    );
  }

  const slideWidthPct = 100 / visibleCount;
  const translateX = -(currentIndex * slideWidthPct);
  const showControls = images.length > visibleCount;

  return (
    <div
      className="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="carousel-track"
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {images.map((img, index) => (
          <div key={img.id} className="carousel-slide">
            <img
              src={`${API_URL}${img.imageUrl}`}
              alt={img.originalName || `Immagine ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {showControls && (
        <>
          <button
            className="carousel-btn prev"
            onClick={prevSlide}
            aria-label="Immagine precedente"
          >
            ‹
          </button>
          <button
            className="carousel-btn next"
            onClick={nextSlide}
            aria-label="Immagine successiva"
          >
            ›
          </button>

          <div className="carousel-indicators">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                className={`indicator ${i === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Vai alla posizione ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .carousel {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: var(--color-ink-light);
          padding: var(--s-4) 0 var(--s-6);
        }

        .carousel-track {
          display: flex;
          transition: transform var(--dur-slow) var(--ease);
          will-change: transform;
        }

        .carousel-slide {
          flex: 0 0 ${slideWidthPct}%;
          padding: 0 var(--s-2);
          box-sizing: border-box;
        }

        .carousel-slide img {
          width: 100%;
          aspect-ratio: 2 / 3;
          object-fit: cover;
          border-radius: var(--r-md, 8px);
          display: block;
        }

        .carousel-btn {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          background: rgba(13, 35, 43, 0.7);
          color: var(--color-paper);
          border: 1px solid var(--color-line-strong);
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          transition: background var(--dur-fast) ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .carousel-btn:hover {
          background: rgba(13, 35, 43, 0.92);
        }

        .carousel-btn:focus-visible {
          outline: 2px solid var(--color-brass-bright);
          outline-offset: 2px;
        }

        .carousel-btn.prev { left: var(--s-2); }
        .carousel-btn.next { right: var(--s-2); }

        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: var(--s-2);
          margin-top: var(--s-4);
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-line-strong);
          border: none;
          cursor: pointer;
          transition: background var(--dur-fast) ease;
          padding: 0;
        }

        .indicator.active {
          background: var(--color-brass-bright);
        }

        .indicator:hover {
          background: var(--color-brass-bright);
        }

        .indicator:focus-visible {
          outline: 2px solid var(--color-brass-bright);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
