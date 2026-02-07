'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('reservations');
    const [reservations, setReservations] = useState([]);
    const [newsList, setNewsList] = useState([]);
    const router = useRouter();

    // Load data on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        fetchReservations(token);
        fetchNews(token);
    }, []);

    const fetchReservations = async (token) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/reservations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setReservations(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchNews = async (token) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/news`); // Public endpoint for list
            if (res.ok) setNewsList(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await fetch(`${API_URL}/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchReservations(token); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/admin/login');
    }

    return (
        <div className="dashboard-container container">
            <div className="dashboard-header">
                <h1>Dashboard Amministrazione</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'reservations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reservations')}
                >
                    Prenotazioni
                </button>
                <button
                    className={`tab ${activeTab === 'news' ? 'active' : ''}`}
                    onClick={() => setActiveTab('news')}
                >
                    Gestione News
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'reservations' && (
                    <div className="reservations-list">
                        <h2>Lista Prenotazioni</h2>
                        {reservations.length === 0 ? <p>Nessuna prenotazione.</p> : (
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Data/Ora</th>
                                            <th>Cliente</th>
                                            <th>Ospiti</th>
                                            <th>Stato</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map(res => (
                                            <tr key={res.id}>
                                                <td>{res.date} {res.time}</td>
                                                <td>{res.firstName} {res.lastName}<br /><small>{res.phone}</small></td>
                                                <td>{res.guests}</td>
                                                <td><span className={`status ${res.status}`}>{res.status}</span></td>
                                                <td>
                                                    {res.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(res.id, 'confirmed')} className="btn-action confirm">✓</button>
                                                            <button onClick={() => handleStatusUpdate(res.id, 'cancelled')} className="btn-action cancel">✗</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'news' && (
                    <div className="news-management">
                        <h2>Gestione News</h2>
                        <p>Funzionalità di aggiunta/modifica news in arrivo...</p>
                        {/* Future implementation: Form to add news */}
                        <ul className="admin-news-list">
                            {newsList.map(item => (
                                <li key={item.id}>
                                    {item.title} - <small>{new Date(item.publishedAt).toLocaleDateString()}</small>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <style jsx>{`
        .dashboard-container {
          padding-top: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .btn-logout {
            background: transparent;
            color: #ff4444;
            border: 1px solid #ff4444;
            padding: 0.5rem 1rem;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
        }

        .tab {
          padding: 1rem 2rem;
          background: transparent;
          color: var(--color-text-muted);
          font-size: 1.1rem;
          border-bottom: 2px solid transparent;
        }

        .tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: var(--color-surface);
        }

        th, td {
            text-align: left;
            padding: 1rem;
            border-bottom: 1px solid var(--color-border);
        }

        th {
            color: var(--color-primary);
        }

        .status {
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            text-transform: uppercase;
        }
        
        .status.pending { background: #ffd700; color: #000; }
        .status.confirmed { background: #4caf50; color: #fff; }
        .status.cancelled { background: #f44336; color: #fff; }

        .btn-action {
            margin-right: 0.5rem;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }
        
        .confirm { background: #4caf50; }
        .cancel { background: #f44336; }
      `}</style>
        </div>
    );
}
