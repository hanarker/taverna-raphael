'use client';

import { useState, useEffect, useCallback } from 'react';

function Toast({ message, type, onDismiss }) {
    useEffect(() => {
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [onDismiss]);

    return (
        <div className={`toast toast-${type}`} role="status" aria-live="polite">
            {message}
            <button className="toast-close" onClick={onDismiss} aria-label="Chiudi notifica">×</button>
            <style jsx>{`
                .toast {
                    position: fixed;
                    bottom: 1.5rem;
                    right: 1.5rem;
                    z-index: 3000;
                    padding: 0.85rem 1.25rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    min-width: 240px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                    animation: toastIn 0.25s ease-out;
                }
                .toast-success { background: #FFFFFF; border-left: 3px solid var(--color-success); border-top: 1px solid var(--color-line); border-right: 1px solid var(--color-line); border-bottom: 1px solid var(--color-line); color: var(--color-success); }
                .toast-error   { background: #FFFFFF; border-left: 3px solid var(--color-danger); border-top: 1px solid var(--color-line); border-right: 1px solid var(--color-line); border-bottom: 1px solid var(--color-line); color: var(--color-danger); }
                .toast-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    font-size: 1.1rem;
                    line-height: 1;
                    margin-left: auto;
                    opacity: 0.7;
                }
                .toast-close:hover { opacity: 1; }
                @keyframes toastIn {
                    from { transform: translateY(12px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="modal-box">
                <p id="confirm-title">{message}</p>
                <div className="modal-actions">
                    <button className="btn btn-danger" onClick={onConfirm}>Elimina</button>
                    <button className="btn btn-secondary" onClick={onCancel}>Annulla</button>
                </div>
            </div>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.55);
                    z-index: 2500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }
                .modal-box {
                    background: #FFFFFF;
                    border: 1px solid var(--color-line);
                    border-radius: var(--r-md);
                    padding: 1.5rem 2rem;
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
                    box-shadow: var(--shadow-raise);
                }
                .modal-box p {
                    margin: 0 0 1.5rem;
                    font-size: 1rem;
                    color: var(--color-ink);
                    line-height: 1.5;
                }
                .modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                }
                .btn { padding: 0.65rem 1.5rem; border-radius: var(--r-sm); cursor: pointer; font-weight: 500; border: none; font-size: 0.9rem; }
                .btn-danger   { background: var(--color-danger); color: #fff; }
                .btn-danger:hover { opacity: 0.85; }
                .btn-secondary { background: transparent; border: 1px solid var(--color-line-strong); color: var(--color-muted); }
                .btn-secondary:hover { border-color: var(--color-ink); color: var(--color-ink); }
            `}</style>
        </div>
    );
}

export default function NewsManager() {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        slug: '',
        tags: []
    });

    const availableTags = [
        'Evento Speciale',
        'Nuovo Menu',
        'Vini',
        'Musica Live',
        'Chiusura'
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API_URL}/api/news`);
            if (res.ok) {
                const data = await res.json();
                setNewsList(data);
            }
        } catch {
            showToast('Errore nel caricamento delle news', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => {
            const list = prev.tags || [];
            return {
                ...prev,
                tags: list.includes(tag)
                    ? list.filter(t => t !== tag)
                    : [...list, tag]
            };
        });
    };

    const generateSlug = (title) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const submissionData = {
            ...formData,
            slug: formData.slug || generateSlug(formData.title)
        };

        try {
            const url = isEditing && currentItem
                ? `${API_URL}/api/news/${currentItem.id}`
                : `${API_URL}/api/news`;

            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                fetchNews();
                resetForm();
                showToast(isEditing ? 'Notizia aggiornata' : 'Notizia pubblicata', 'success');
            } else {
                showToast('Errore nel salvataggio', 'error');
            }
        } catch {
            showToast('Errore di connessione', 'error');
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchNews();
                showToast('Notizia eliminata', 'success');
            } else {
                showToast('Errore nell\'eliminazione', 'error');
            }
        } catch {
            showToast('Errore di connessione', 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    const startEdit = (item) => {
        setIsEditing(true);
        setCurrentItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            image: item.image || '',
            slug: item.slug,
            tags: item.tags || []
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentItem(null);
        setFormData({ title: '', content: '', image: '', slug: '', tags: [] });
    };

    if (loading) return <div style={{ color: 'var(--color-text-muted)', padding: '1rem' }}>Caricamento news...</div>;

    return (
        <div className="news-manager">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast(null)}
                />
            )}

            {confirmDelete && (
                <ConfirmModal
                    message="Eliminare questa notizia? L'operazione non è reversibile."
                    onConfirm={() => handleDelete(confirmDelete)}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            <h2>Gestione News</h2>

            <form onSubmit={handleSubmit} className="news-form">
                <h3>{isEditing ? 'Modifica Notizia' : 'Nuova Notizia'}</h3>

                <div className="form-group">
                    <label htmlFor="title">Titolo</label>
                    <input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="image">URL Immagine</label>
                    <input id="image" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Contenuto</label>
                    <textarea id="content" name="content" value={formData.content} onChange={handleInputChange} rows="5" required />
                </div>

                <div className="form-group">
                    <label>Etichette</label>
                    <div className="tags-grid" role="group" aria-label="Seleziona etichette">
                        {availableTags.map(t => (
                            <button
                                key={t}
                                type="button"
                                className={`tag-btn ${formData.tags.includes(t) ? 'active' : ''}`}
                                onClick={() => handleTagToggle(t)}
                                aria-pressed={formData.tags.includes(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">{isEditing ? 'Aggiorna' : 'Pubblica Notizia'}</button>
                    {isEditing && <button type="button" onClick={resetForm} className="btn btn-secondary">Annulla</button>}
                </div>
            </form>

            <div className="news-list">
                <h3>Notizie Pubblicate</h3>
                {newsList.map(item => (
                    <div key={item.id} className="news-item-card">
                        <div className="item-info">
                            <h5>{item.title}</h5>
                            <small>{new Date(item.publishedAt).toLocaleDateString('it-IT')}</small>
                            {item.tags?.length > 0 && (
                                <div className="item-tags">
                                    {item.tags.map(t => (
                                        <span key={t} className="tag-badge">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="item-actions">
                            <button
                                onClick={() => startEdit(item)}
                                aria-label={`Modifica ${item.title}`}
                                className="action-btn edit-btn"
                            >
                                Modifica
                            </button>
                            <button
                                onClick={() => setConfirmDelete(item.id)}
                                aria-label={`Elimina ${item.title}`}
                                className="action-btn delete-btn"
                            >
                                Elimina
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .news-manager { color: var(--color-ink); }
                .news-form { background: var(--color-panna); padding: 1.5rem; border-radius: var(--r-md); margin-bottom: 2rem; border: 1px solid var(--color-line); }
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; color: var(--color-ink); font-size: 0.8125rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
                input, textarea {
                    width: 100%; padding: 0.7rem;
                    background: #FFFFFF;
                    border: 1px solid var(--color-line-strong);
                    color: var(--color-ink);
                    border-radius: var(--r-sm);
                    font-size: 0.95rem;
                    font-family: var(--font-body);
                }
                input:focus, textarea:focus {
                    outline: 2px solid var(--color-sabbia);
                    outline-offset: -1px;
                    border-color: var(--color-sabbia);
                }

                .tags-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .tag-btn {
                    background: #FFFFFF;
                    border: 1px solid var(--color-line-strong);
                    color: var(--color-muted);
                    padding: 0.35rem 0.85rem;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.8125rem;
                    font-family: var(--font-body);
                }
                .tag-btn:hover { border-color: var(--color-sabbia); color: var(--color-ink); }
                .tag-btn.active { background: var(--color-sabbia); color: var(--color-ink); border-color: var(--color-sabbia); font-weight: 600; }

                .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn { padding: 0.75rem 1.5rem; border: 1px solid transparent; border-radius: var(--r-sm); cursor: pointer; font-weight: 500; font-size: 0.875rem; font-family: var(--font-body); }
                .btn-primary { background: var(--color-sabbia); color: var(--color-ink); border-color: var(--color-sabbia); }
                .btn-primary:hover { opacity: 0.85; }
                .btn-secondary { background: transparent; border: 1px solid var(--color-line-strong); color: var(--color-muted); }
                .btn-secondary:hover { border-color: var(--color-ink); color: var(--color-ink); }

                .news-item-card {
                    background: #FFFFFF;
                    padding: 1rem;
                    border-radius: var(--r-sm);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border: 1px solid var(--color-line);
                    margin-bottom: 1rem;
                    gap: 0.75rem;
                }
                .item-info h5 { margin: 0 0 0.2rem 0; font-family: var(--font-display); font-size: 1rem; font-weight: 500; color: var(--color-ink); text-transform: none; }
                .item-info small { color: var(--color-muted); font-size: 0.8rem; }
                .item-tags { margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
                .tag-badge {
                    font-size: 0.75rem;
                    padding: 0.15rem 0.5rem;
                    background: rgba(223,185,136,0.12);
                    border: 1px solid rgba(223,185,136,0.35);
                    color: var(--color-muted);
                    border-radius: var(--r-sm);
                }

                .item-actions { display: flex; flex-direction: column; gap: 0.4rem; flex-shrink: 0; }
                .action-btn {
                    padding: 0.35rem 0.75rem;
                    border-radius: var(--r-sm);
                    cursor: pointer;
                    font-size: 0.78rem;
                    font-weight: 500;
                    border: none;
                    transition: opacity 0.2s;
                    white-space: nowrap;
                    font-family: var(--font-body);
                }
                .edit-btn { background: rgba(223,185,136,0.15); color: var(--color-ink); border: 1px solid rgba(223,185,136,0.4); }
                .edit-btn:hover { background: rgba(223,185,136,0.3); }
                .delete-btn { background: rgba(194,94,94,0.12); color: var(--color-danger); border: 1px solid rgba(194,94,94,0.3); }
                .delete-btn:hover { background: rgba(194,94,94,0.2); }

                h2 { margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 500; color: var(--color-ink); text-transform: none; }
                h3 { margin-bottom: 1rem; font-size: 1rem; font-weight: 500; color: var(--color-muted); text-transform: none; }
            `}</style>
        </div>
    );
}
