'use client';

import { useState, useEffect } from 'react';

export default function MenuManager() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // Form state
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
        { name: 'Glutine', icon: '🌾' },
        { name: 'Latte', icon: '🥛' },
        { name: 'Uova', icon: '🥚' },
        { name: 'Frutta a guscio', icon: '🥜' },
        { name: 'Pesce', icon: '🐟' },
        { name: 'Crostacei', icon: '🦐' },
        { name: 'Soia', icon: '🫘' },
        { name: 'Vegetariano', icon: '🥬' },
        { name: 'Piccante', icon: '🌶️' }
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
        } catch (err) {
            setError('Errore nel caricamento del menu');
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
            const currentAllergens = prev.allergens || [];
            if (currentAllergens.includes(allergen)) {
                return { ...prev, allergens: currentAllergens.filter(a => a !== allergen) };
            } else {
                return { ...prev, allergens: [...currentAllergens, allergen] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const url = isEditing && currentItem
                ? `${API_URL}/api/menu/${currentItem.id}`
                : `${API_URL}/api/menu`;

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchMenuItems();
                resetForm();
            } else {
                setError('Errore nel salvataggio');
            }
        } catch (err) {
            setError('Errore di connessione');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Sei sicuro di voler eliminare questo piatto?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) fetchMenuItems();
        } catch (err) {
            setError('Errore nell\'eliminazione');
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

    if (loading) return <div>Caricamento menu...</div>;

    return (
        <div className="menu-manager">
            <h2>Gestione Menu</h2>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit} className="menu-form">
                <h3>{isEditing ? 'Modifica Piatto' : 'Nuovo Piatto'}</h3>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Nome Piatto</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Prezzo (€)</label>
                        <input type="number" step="0.50" name="price" value={formData.price} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Categoria</label>
                        <select name="category" value={formData.category} onChange={handleInputChange}>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>URL Immagine</label>
                        <input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                    </div>
                </div>

                <div className="form-group">
                    <label>Descrizione</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
                </div>

                <div className="form-group">
                    <label>Allergeni e Caratteristiche</label>
                    <div className="allergens-grid">
                        {availableAllergens.map(a => (
                            <button
                                key={a.name}
                                type="button"
                                className={`allergen-btn ${formData.allergens.includes(a.name) ? 'active' : ''}`}
                                onClick={() => handleAllergenToggle(a.name)}
                            >
                                {a.icon} {a.name}
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
                                            <div className="item-icons">
                                                {item.allergens?.map(a => {
                                                    const icon = availableAllergens.find(al => al.name === a)?.icon;
                                                    return <span key={a} title={a}>{icon}</span>
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
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .menu-manager { color: var(--color-text); }
                .menu-form { background: var(--color-surface); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid var(--color-border); }
                .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; color: var(--color-text-muted); font-size: 0.9rem; }
                input, select, textarea { width: 100%; padding: 0.8rem; background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 4px; }
                
                .allergens-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .allergen-btn { background: var(--color-bg); border: 1px solid var(--color-border); color: var(--color-text-muted); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
                .allergen-btn.active { background: var(--color-primary); color: var(--color-bg); border-color: var(--color-primary); }
                
                .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn { padding: 0.8rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                .btn-primary { background: var(--color-primary); color: var(--color-bg); }
                .btn-secondary { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
                
                .menu-category-group { margin-bottom: 2rem; }
                .menu-category-group h4 { color: var(--color-primary); border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1rem; }
                .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
                .menu-item-card { background: var(--color-surface); padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--color-border); }
                .item-info h5 { margin: 0 0 0.2rem 0; font-size: 1.1rem; }
                .price { color: var(--color-gold); font-weight: bold; margin: 0; }
                .item-icons { font-size: 1.2rem; margin-top: 0.5rem; }
                .item-actions button { background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0.2rem; margin-left: 0.5rem; transition: transform 0.2s; }
                .item-actions button:hover { transform: scale(1.1); }
                .delete-btn:hover { filter: drop-shadow(0 0 2px red); }
                .error { color: #ff4444; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
}
