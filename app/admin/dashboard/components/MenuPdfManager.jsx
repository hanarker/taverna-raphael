'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

export default function MenuPdfManager() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [message, setMessage] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const getToken = () => localStorage.getItem('token');

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/menu`);
      if (res.ok) {
        const data = await res.json();
        setMenuData(data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMenu();
    setQrUrl(`${window.location.origin}/menu`);
  }, [fetchMenu]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('menu-pdf-input');
    const file = fileInput?.files[0];

    if (!file) {
      setMessage({ type: 'error', text: 'Seleziona un file PDF' });
      return;
    }

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Solo file PDF sono ammessi' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/menu`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setMenuData({ pdfUrl: data.pdfUrl, originalName: data.originalName });
        setMessage({ type: 'success', text: 'Menu caricato con successo' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.message || 'Errore nel caricamento' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore di connessione' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare il menu?')) return;

    try {
      const res = await fetch(`${API_URL}/api/menu`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (res.ok) {
        setMenuData(null);
        setMessage({ type: 'success', text: 'Menu eliminato' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.message || 'Errore' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore di connessione' });
    }
  };

  const generateQrCode = async () => {
    try {
      const url = qrUrl || `${window.location.origin}/menu`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: { dark: '#1B2A38', light: '#F8F5F0' }
      });
      setQrUrl(url);
      setQrGenerated(dataUrl);
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore generazione QR' });
    }
  };

  const downloadQrCode = () => {
    if (!qrGenerated) return;
    const link = document.createElement('a');
    link.download = 'menu-qrcode.png';
    link.href = qrGenerated;
    link.click();
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div className="menu-pdf-manager">
      <div className="section">
        <h3>Menu PDF</h3>
        <p className="hint">Carica il file PDF del menu. Verrà mostrato sulla pagina /menu.</p>

        {menuData?.pdfUrl && (
          <div className="current-menu">
            <p><strong>Menu attuale:</strong> {menuData.originalName}</p>
          </div>
        )}

        <form onSubmit={handleUpload} className="upload-form">
          <input
            id="menu-pdf-input"
            type="file"
            accept="application/pdf"
            disabled={uploading}
          />
          <button type="submit" className="btn" disabled={uploading}>
            {uploading ? 'Caricamento...' : menuData?.pdfUrl ? 'Sostituisci' : 'Carica'}
          </button>
          {menuData?.pdfUrl && (
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Elimina
            </button>
          )}
        </form>

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
      </div>

      <div className="section">
        <h3>QR Code</h3>
        <p className="hint">Genera il QR code per i tavoli. I clienti lo scannerizzano per vedere il menu.</p>

        <div className="qr-input-group">
          <label htmlFor="qr-url">URL del menu:</label>
          <input
            id="qr-url"
            type="text"
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="qr-actions">
          <button type="button" className="btn" onClick={generateQrCode}>
            Genera QR
          </button>
          {qrGenerated && (
            <button type="button" className="btn" onClick={downloadQrCode}>
              Scarica PNG
            </button>
          )}
        </div>

        {qrGenerated && (
          <div className="qr-preview">
            <img src={qrGenerated} alt="QR Code" />
          </div>
        )}
      </div>

      <style jsx>{`
        .menu-pdf-manager {
          display: flex;
          flex-direction: column;
          gap: var(--s-8);
        }

        .section {
          padding: var(--s-6);
          background: var(--color-ink);
          border: 1px solid var(--color-line);
          border-radius: var(--r-md);
        }

        .section h3 {
          margin: 0 0 var(--s-2);
          font-family: var(--font-display);
          font-size: var(--fs-h3);
          color: var(--color-paper);
        }

        .hint {
          color: var(--color-text-soft);
          font-size: 0.875rem;
          margin-bottom: var(--s-4);
        }

        .current-menu {
          padding: var(--s-4);
          background: var(--color-ink-light);
          border-radius: var(--r-sm);
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

        .qr-input-group {
          display: flex;
          flex-direction: column;
          gap: var(--s-2);
          margin-bottom: var(--s-4);
        }

        .qr-input-group input {
          padding: var(--s-2) var(--s-3);
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          color: var(--color-paper);
          font-size: 0.875rem;
          color-scheme: dark;
        }

        .qr-actions {
          display: flex;
          gap: var(--s-4);
          margin-bottom: var(--s-4);
        }

        .qr-preview {
          display: flex;
          justify-content: center;
        }

        .qr-preview img {
          width: 256px;
          height: 256px;
          border: 1px solid var(--color-line);
          border-radius: var(--r-sm);
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

        .btn-danger {
          background: var(--color-danger);
        }
      `}</style>
    </div>
  );
}