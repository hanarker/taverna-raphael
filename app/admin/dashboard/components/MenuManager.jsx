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
                    color: var(--color-muted);
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

export default function MenuManager() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Antipasti',
        imageUrl: '',
        allergens: [],
        available: true
    });

    const categories = ['Antipasti', 'Primi', 'Secondi', 'Dolci', 'Vini', 'Bevande'];
    const availableAllergens = [
        'Glutine', 'Latte', 'Uova', 'Frutta a guscio',
        'Pesce', 'Crostacei', 'Soia', 'Vegetariano', 'Piccante'
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const res = await fetch(`${API_URL}/api/menu`);
            if (res.ok) {
                const data = await res.json();
                setMenuItems(data);
            }
        } catch {
            showToast('Errore nel caricamento del menu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAllergenToggle = (allergen) => {
        setFormData(prev => {
            const list = prev.allergens || [];
            return {
                ...prev,
                allergens: list.includes(allergen)
                    ? list.filter(a => a !== allergen)
                    : [...list, allergen]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const url = isEditing && currentItem
                ? `${API_URL}/api/menu/${currentItem.id}`
                : `${API_URL}/api/menu`;

            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchMenuItems();
                resetForm();
                showToast(isEditing ? 'Piatto aggiornato' : 'Piatto aggiunto', 'success');
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
            const res = await fetch(`${API_URL}/api/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchMenuItems();
                showToast('Piatto eliminato', 'success');
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
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl || '',
            allergens: item.allergens || [],
            available: item.available
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Antipasti',
            imageUrl: '',
            allergens: [],
            available: true
        });
    };

    if (loading) return <div style={{ color: 'var(--color-text-muted)', padding: '1rem' }}>Caricamento menu...</div>;

    return (
        <div className="menu-manager">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast(null)}
                />
            )}

            {confirmDelete && (
                <ConfirmModal
                    message="Eliminare questo piatto? L'operazione non è reversibile."
                    onConfirm={() => handleDelete(confirmDelete)}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            <h2>Gestione Menu</h2>

            <form onSubmit={handleSubmit} className="menu-form">
                <h3>{isEditing ? 'Modifica Piatto' : 'Nuovo Piatto'}</h3>

                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Nome Piatto</label>
                        <input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Prezzo (€)</label>
                        <input id="price" type="number" step="0.50" name="price" value={formData.price} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Categoria</label>
                        <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="imageUrl">URL Immagine</label>
                        <input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrizione</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" />
                </div>

                <div className="form-group">
                    <label>Allergeni e Caratteristiche</label>
                    <div className="allergens-grid" role="group" aria-label="Seleziona allergeni">
                        {availableAllergens.map(a => (
                            <button
                                key={a}
                                type="button"
                                className={`allergen-btn ${formData.allergens.includes(a) ? 'active' : ''}`}
                                onClick={() => handleAllergenToggle(a)}
                                aria-pressed={formData.allergens.includes(a)}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">{isEditing ? 'Aggiorna' : 'Aggiungi Piatto'}</button>
                    {isEditing && <button type="button" onClick={resetForm} className="btn btn-secondary">Annulla</button>}
                </div>
            </form>

            <div className="menu-list">
                <h3>Lista Piatti</h3>
                {categories.map(cat => {
                    const items = menuItems.filter(i => i.category === cat);
                    if (items.length === 0) return null;

                    return (
                        <div key={cat} className="menu-category-group">
                            <h4>{cat}</h4>
                            <div className="items-grid">
                                {items.map(item => (
                                    <div key={item.id} className="menu-item-card">
                                        <div className="item-info">
                                            <h5>{item.name}</h5>
                                            <p className="price">€ {item.price}</p>
                                            {item.allergens?.length > 0 && (
                                                <p className="item-allergens-text">
                                                    {item.allergens.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                onClick={() => startEdit(item)}
                                                aria-label={`Modifica ${item.name}`}
                                                className="action-btn edit-btn"
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(item.id)}
                                                aria-label={`Elimina ${item.name}`}
                                                className="action-btn delete-btn"
                                            >
                                                Elimina
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .menu-manager { color: var(--color-ink); }
                .menu-form { background: var(--color-panna); padding: 1.5rem; border-radius: var(--r-md); margin-bottom: 2rem; border: 1px solid var(--color-line); }
                .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; color: var(--color-ink); font-size: 0.8125rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
                input, select, textarea {
                    width: 100%; padding: 0.7rem;
                    background: #FFFFFF;
                    border: 1px solid var(--color-line-strong);
                    color: var(--color-ink);
                    border-radius: var(--r-sm);
                    font-size: 0.95rem;
                    font-family: var(--font-body);
                }
                input:focus, select:focus, textarea:focus {
                    outline: 2px solid var(--color-sabbia);
                    outline-offset: -1px;
                    border-color: var(--color-sabbia);
                }

                .allergens-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .allergen-btn {
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
                .allergen-btn:hover { border-color: var(--color-sabbia); color: var(--color-ink); }
                .allergen-btn.active { background: var(--color-sabbia); color: var(--color-ink); border-color: var(--color-sabbia); font-weight: 600; }

                .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn { padding: 0.75rem 1.5rem; border: 1px solid transparent; border-radius: var(--r-sm); cursor: pointer; font-weight: 500; font-size: 0.875rem; font-family: var(--font-body); }
                .btn-primary { background: var(--color-sabbia); color: var(--color-ink); border-color: var(--color-sabbia); }
                .btn-primary:hover { opacity: 0.85; }
                .btn-secondary { background: transparent; border: 1px solid var(--color-line-strong); color: var(--color-muted); }
                .btn-secondary:hover { border-color: var(--color-ink); color: var(--color-ink); }

                .menu-category-group { margin-bottom: 2rem; }
                .menu-category-group h4 { font-family: var(--font-display); font-size: 1rem; font-weight: 500; color: var(--color-sabbia); border-bottom: 1px solid var(--color-line); padding-bottom: 0.5rem; margin-bottom: 1rem; text-transform: none; }
                .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
                .menu-item-card {
                    background: #FFFFFF;
                    padding: 1rem;
                    border-radius: var(--r-sm);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border: 1px solid var(--color-line);
                    gap: 0.75rem;
                }
                .item-info h5 { margin: 0 0 0.2rem 0; font-family: var(--font-display); font-size: 1rem; font-weight: 500; color: var(--color-ink); text-transform: none; }
                .price { color: var(--color-sabbia); font-weight: 500; margin: 0 0 0.3rem; font-size: 0.9rem; }
                .item-allergens-text { font-size: 0.78rem; color: var(--color-muted); margin: 0; }

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
