'use client';

import { useState, useEffect, useCallback } from 'react';

export default function CarouselManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const getToken = () => localStorage.getItem('token');

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/carousel`);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('carousel-input');
    const file = fileInput?.files[0];

    if (!file) {
      setMessage({ type: 'error', text: 'Seleziona un file immagine' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Solo immagini sono ammesse' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'immagine non deve superare 5 MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/carousel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });

      if (res.ok) {
        const newImage = await res.json();
        setImages(prev => [...prev, newImage]);
        setMessage({ type: 'success', text: 'Immagine caricata' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.message || 'Errore' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore di connessione' });
    } finally {
      setUploading(false);
      if (fileInput) fileInput.value = '';
    }
  };

  const handleReorder = async (direction, index) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);

    try {
      const order = newImages.map(img => img.id);
      await fetch(`${API_URL}/api/carousel/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ order })
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore nel riordinamento' });
      fetchImages();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return;

    try {
      const res = await fetch(`${API_URL}/api/carousel/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
        setMessage({ type: 'success', text: 'Immagine eliminata' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.message || 'Errore' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore di connessione' });
    }
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div className="carousel-manager">
      <div className="section">
        <h3>Carosello Home</h3>
        <p className="hint">Gestisci le immagini che scorrono sulla homepage. Carica nuove immagini e riordinale.</p>

        <form onSubmit={handleUpload} className="upload-form">
          <input
            id="carousel-input"
            type="file"
            accept="image/*"
            disabled={uploading}
          />
          <button type="submit" className="btn" disabled={uploading}>
            {uploading ? 'Caricamento...' : 'Carica immagine'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
      </div>

      <div className="section">
        <h4>Immagini ({images.length})</h4>
        {images.length === 0 ? (
          <p className="empty">Nessuna immagine caricata.</p>
        ) : (
          <div className="image-list">
            {images.map((img, index) => (
              <div key={img.id} className="image-item">
                <img
                  src={`${API_URL}${img.imageUrl}`}
                  alt={img.originalName}
                  className="thumb"
                />
                <div className="image-info">
                  <span className="filename">{img.originalName}</span>
                  <span className="order">#{index + 1}</span>
                </div>
                <div className="image-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleReorder('up', index)}
                    disabled={index === 0}
                    title="Sposta su"
                  >
                    ↑
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleReorder('down', index)}
                    disabled={index === images.length - 1}
                    title="Sposta giù"
                  >
                    ↓
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(img.id)}
                    title="Elimina"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .carousel-manager {
          display: flex;
          flex-direction: column;
          gap: var(--s-6);
        }

        .section {
          padding: var(--s-6);
          background: var(--color-ink);
          border: 1px solid var(--color-line);
          border-radius: var(--r-md);
        }

        .section h3, .section h4 {
          margin: 0 0 var(--s-2);
          font-family: var(--font-display);
          color: var(--color-paper);
        }

        .section h4 {
          font-size: 1rem;
          margin-top: var(--s-4);
        }

        .hint, .empty {
          color: var(--color-text-soft);
          font-size: 0.875rem;
          margin-bottom: var(--s-4);
        }

        .upload-form {
          display: flex;
          gap: var(--s-4);
          align-items: center;
          flex-wrap: wrap;
        }

        .upload-form input[type="file"] {
          flex: 1;
          min-width: 200px;
        }

        .image-list {
          display: flex;
          flex-direction: column;
          gap: var(--s-3);
        }

        .image-item {
          display: flex;
          align-items: center;
          gap: var(--s-4);
          padding: var(--s-3);
          background: var(--color-ink-light);
          border-radius: var(--r-sm);
        }

        .thumb {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: var(--r-sm);
        }

        .image-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--s-1);
        }

        .filename {
          font-size: 0.875rem;
          color: var(--color-paper);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }

        .order {
          font-size: 0.75rem;
          color: var(--color-text-soft);
        }

        .image-actions {
          display: flex;
          gap: var(--s-2);
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-brass);
          color: var(--color-ink);
          border: none;
          border-radius: var(--r-sm);
          cursor: pointer;
          font-size: 1rem;
          transition: opacity var(--dur-fast);
        }

        .btn-icon:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-icon:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-icon.btn-danger {
          background: var(--color-danger);
        }

        .message {
          margin-top: var(--s-4);
          padding: var(--s-3);
          border-radius: var(--r-sm);
        }

        .message.success {
          background: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
        }

        .message.error {
          background: rgba(244, 67, 54, 0.1);
          color: var(--color-danger);
        }

        .loading {
          padding: var(--s-8);
          text-align: center;
          color: var(--color-text-soft);
        }

        .btn {
          padding: var(--s-2) var(--s-4);
          background: var(--color-brass);
          color: var(--color-ink);
          border: none;
          border-radius: var(--r-sm);
          cursor: pointer;
          font-size: 0.875rem;
          transition: opacity var(--dur-fast);
        }

        .btn:hover {
          opacity: 0.9;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}