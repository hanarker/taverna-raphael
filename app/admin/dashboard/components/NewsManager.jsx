'use client';

import { useState, useEffect } from 'react';

export default function NewsManager() {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        slug: '',
        tags: [] // Using tags for "features/allergens" equivalent in news
    });

    // Example tags relevant for news/events
    const availableTags = [
        { name: 'Evento Speciale', icon: '🎉' },
        { name: 'Nuovo Menu', icon: '🍽️' },
        { name: 'Vini', icon: '🍷' },
        { name: 'Musica Live', icon: '🎵' },
        { name: 'Chiusura', icon: '🔒' }
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
        } catch (err) {
            setError('Errore nel caricamento delle news');
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
            const currentTags = prev.tags || [];
            if (currentTags.includes(tag)) {
                return { ...prev, tags: currentTags.filter(t => t !== tag) };
            } else {
                return { ...prev, tags: [...currentTags, tag] };
            }
        });
    };

    const generateSlug = (title) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Auto-generate slug if empty
        const submissionData = {
            ...formData,
            slug: formData.slug || generateSlug(formData.title)
        };

        try {
            const url = isEditing && currentItem
                ? `${API_URL}/api/news/${currentItem.id}`
                : `${API_URL}/api/news`;

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                fetchNews();
                resetForm();
            } else {
                setError('Errore nel salvataggio');
            }
        } catch (err) {
            setError('Errore di connessione');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Sei sicuro di voler eliminare questa notizia?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) fetchNews();
        } catch (err) {
            setError('Errore nell\'eliminazione');
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
        setFormData({
            title: '',
            content: '',
            image: '',
            slug: '',
            tags: []
        });
    };

    if (loading) return <div>Caricamento news...</div>;

    return (
        <div className="news-manager">
            <h2>Gestione News</h2>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit} className="news-form">
                <h3>{isEditing ? 'Modifica Notizia' : 'Nuova Notizia'}</h3>

                <div className="form-group">
                    <label>Titolo</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                    <label>URL Immagine</label>
                    <input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                </div>

                <div className="form-group">
                    <label>Contenuto</label>
                    <textarea name="content" value={formData.content} onChange={handleInputChange} rows="5" required />
                </div>

                <div className="form-group">
                    <label>Etichette</label>
                    <div className="tags-grid">
                        {availableTags.map(t => (
                            <button
                                key={t.name}
                                type="button"
                                className={`tag-btn ${formData.tags.includes(t.name) ? 'active' : ''}`}
                                onClick={() => handleTagToggle(t.name)}
                            >
                                {t.icon} {t.name}
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
                            <small>{new Date(item.publishedAt).toLocaleDateString()}</small>
                            <div className="item-tags">
                                {item.tags?.map(t => {
                                    const icon = availableTags.find(at => at.name === t)?.icon;
                                    return <span key={t} title={t}>{icon} {t}</span>
                                })}
                            </div>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => startEdit(item)}>✏️</button>
                            <button onClick={() => handleDelete(item.id)} className="delete-btn">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .news-manager { color: var(--color-text); }
                .news-form { background: var(--color-surface); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid var(--color-border); }
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; color: var(--color-text-muted); font-size: 0.9rem; }
                input, textarea { width: 100%; padding: 0.8rem; background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 4px; }
                
                .tags-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .tag-btn { background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text-muted); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
                .tag-btn.active { background: var(--color-primary); color: var(--color-bg); border-color: var(--color-primary); }
                
                .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn { padding: 0.8rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                .btn-primary { background: var(--color-primary); color: var(--color-bg); }
                .btn-secondary { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
                
                .news-item-card { background: var(--color-surface); padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--color-border); margin-bottom: 1rem; }
                .item-info h5 { margin: 0 0 0.2rem 0; font-size: 1.1rem; }
                .item-info small { color: var(--color-text-muted); }
                .item-tags { margin-top: 0.5rem; font-size: 0.9rem; color: var(--color-gold); }
                .item-tags span { margin-right: 0.5rem; }
                
                .item-actions button { background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0.2rem; margin-left: 0.5rem; transition: transform 0.2s; }
                .item-actions button:hover { transform: scale(1.1); }
                .delete-btn:hover { filter: drop-shadow(0 0 2px red); }
                .error { color: #ff4444; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
}
