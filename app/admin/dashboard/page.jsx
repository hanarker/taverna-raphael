'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import MenuManager from './components/MenuManager';
import NewsManager from './components/NewsManager';

const SHIFT_LABELS = {
    lunch:   'Pranzo',
    dinner1: 'Cena 1',
    dinner2: 'Cena 2',
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('reservations');
    const [reservations, setReservations] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [availability, setAvailability] = useState(null);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchReservations(token, '');
    }, []);

    const fetchReservations = async (token, date) => {
        try {
            const params = date ? `?date=${date}` : '';
            const res = await fetch(`${API_URL}/api/reservations${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setReservations(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAvailability = async (date) => {
        try {
            const res = await fetch(`${API_URL}/api/reservations/availability?date=${date}`);
            if (res.ok) setAvailability(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handleDateFilter = (date) => {
        setFilterDate(date);
        const token = localStorage.getItem('token');
        if (!token) return;
        fetchReservations(token, date);
        if (date) fetchAvailability(date);
        else setAvailability(null);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchReservations(token, filterDate);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Eliminare questa prenotazione?')) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/reservations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReservations(token, filterDate);
            if (filterDate) fetchAvailability(filterDate);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/admin/login');
    };

    return (
        <div className="dashboard-container container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>Prenotazioni</button>
                <button className={`tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Gestione Menu</button>
                <button className={`tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>Gestione News</button>
            </div>

            <div className="tab-content">
                {activeTab === 'reservations' && (
                    <div className="reservations-section">
                        <div className="reservations-toolbar">
                            <h2>Lista Prenotazioni</h2>
                            <div className="filter-row">
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={e => handleDateFilter(e.target.value)}
                                    className="date-filter"
                                    aria-label="Filtra per data"
                                />
                                {filterDate && (
                                    <button className="btn-clear-filter" onClick={() => handleDateFilter('')}>
                                        Tutte
                                    </button>
                                )}
                            </div>
                        </div>

                        {availability && filterDate && (
                            <div className="capacity-summary" aria-label="Disponibilità turni">
                                {Object.entries(SHIFT_LABELS).map(([key, label]) => {
                                    const s = availability.shifts?.[key];
                                    if (!s) return null;
                                    const isFull = s.available === 0;
                                    return (
                                        <span key={key} className={`capacity-badge${isFull ? ' full' : ''}`}>
                                            {label} {s.booked}/{availability.capacity}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        {reservations.length === 0 ? (
                            <p className="empty-msg">Nessuna prenotazione.</p>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Turno</th>
                                            <th>Cliente</th>
                                            <th>Ospiti</th>
                                            <th>Stato</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map(res => (
                                            <tr key={res.id}>
                                                <td>{res.date}</td>
                                                <td>
                                                    <span className={`turn-badge turn-${res.turn}`}>
                                                        {SHIFT_LABELS[res.turn] ?? res.turn}
                                                    </span>
                                                </td>
                                                <td>
                                                    {res.firstName} {res.lastName}
                                                    <br />
                                                    <small>{res.phone} · {res.email}</small>
                                                    {res.notes && <><br /><small className="notes-text">&ldquo;{res.notes}&rdquo;</small></>}
                                                </td>
                                                <td>{res.guests}</td>
                                                <td><span className={`status ${res.status}`}>{res.status}</span></td>
                                                <td>
                                                    <div className="action-btns">
                                                        {res.status === 'pending' && (<>
                                                            <button onClick={() => handleStatusUpdate(res.id, 'confirmed')} className="btn-action confirm" aria-label="Conferma prenotazione">✓</button>
                                                            <button onClick={() => handleStatusUpdate(res.id, 'cancelled')} className="btn-action cancel" aria-label="Cancella prenotazione">✗</button>
                                                        </>)}
                                                        <button onClick={() => handleDelete(res.id)} className="btn-action delete" aria-label="Elimina prenotazione">🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'menu' && <MenuManager />}
                {activeTab === 'news' && <NewsManager />}
            </div>

            <style jsx>{`
        .dashboard-container {
          padding-top: var(--s-16);
          padding-bottom: var(--s-16);
          min-height: 100dvh;
          background: var(--color-panna);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--s-8);
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 500;
          color: var(--color-ink);
        }

        .btn-logout {
          background: transparent;
          color: var(--color-danger);
          border: 1px solid rgba(194, 94, 94, 0.4);
          border-radius: var(--r-sm);
          padding: 0.5rem 1rem;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }

        .btn-logout:hover {
          background: rgba(194, 94, 94, 0.08);
          border-color: var(--color-danger);
        }

        .tabs {
          display: flex;
          gap: var(--s-2);
          margin-bottom: var(--s-8);
          border-bottom: 1px solid var(--color-line);
        }

        .tab {
          padding: var(--s-4) var(--s-8);
          background: transparent;
          color: var(--color-muted);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }

        .tab:hover { color: var(--color-ink); }

        .tab.active {
          color: var(--color-ink);
          border-bottom-color: var(--color-sabbia);
        }

        .tab-content {
          background: #FFFFFF;
          border: 1px solid var(--color-line);
          border-radius: var(--r-md);
          padding: var(--s-8);
        }

        .reservations-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--s-4);
          margin-bottom: var(--s-4);
        }

        .reservations-toolbar h2 {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--color-ink);
          margin: 0;
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: var(--s-3);
        }

        .date-filter {
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          padding: 0.4rem 0.75rem;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-ink);
          background: #FFFFFF;
          color-scheme: light;
          cursor: pointer;
        }

        .date-filter:focus {
          outline: 2px solid var(--color-sabbia);
          outline-offset: 2px;
        }

        .btn-clear-filter {
          background: transparent;
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          padding: 0.4rem 0.75rem;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-muted);
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease);
        }

        .btn-clear-filter:hover { color: var(--color-ink); }

        .capacity-summary {
          display: flex;
          gap: var(--s-3);
          flex-wrap: wrap;
          margin-bottom: var(--s-6);
        }

        .capacity-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: var(--r-sm);
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 500;
          background: rgba(108, 146, 181, 0.10);
          border: 1px solid rgba(108, 146, 181, 0.3);
          color: var(--color-azzurro);
        }

        .capacity-badge.full {
          background: rgba(194, 94, 94, 0.10);
          border-color: rgba(194, 94, 94, 0.3);
          color: var(--color-danger);
        }

        .empty-msg {
          color: var(--color-muted);
          padding: var(--s-8) 0;
          text-align: center;
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--color-line);
          border-radius: var(--r-md);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #FFFFFF;
        }

        th {
          font-family: var(--font-body);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: var(--color-sabbia);
          padding: var(--s-4);
          text-align: left;
          border-bottom: 1px solid var(--color-line);
          background: var(--color-panna);
        }

        td {
          padding: var(--s-4);
          color: var(--color-ink);
          border-bottom: 1px solid var(--color-line);
          font-size: 0.9375rem;
          vertical-align: top;
        }

        td small {
          color: var(--color-muted);
          font-size: 0.8125rem;
          display: block;
          margin-top: 0.15rem;
        }

        .notes-text { font-style: italic; }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: var(--color-panna); }

        .turn-badge {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: var(--r-sm);
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(108, 146, 181, 0.12);
          border: 1px solid rgba(108, 146, 181, 0.3);
          color: var(--color-azzurro);
          white-space: nowrap;
        }

        .status {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: var(--r-sm);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .status.pending   { background: rgba(207,169,89,0.12); border: 1px solid rgba(207,169,89,0.4); color: var(--color-warning); }
        .status.confirmed { background: rgba(95,160,119,0.12); border: 1px solid rgba(95,160,119,0.4); color: var(--color-success); }
        .status.cancelled { background: rgba(194,94,94,0.12);  border: 1px solid rgba(194,94,94,0.4);  color: var(--color-danger); }

        .action-btns {
          display: flex;
          gap: var(--s-2);
          flex-wrap: wrap;
        }

        .btn-action {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity var(--dur-fast) var(--ease);
          border: none;
        }

        .confirm { background: rgba(95,160,119,0.15); color: var(--color-success); }
        .confirm:hover { background: rgba(95,160,119,0.3); }
        .cancel  { background: rgba(194,94,94,0.15);  color: var(--color-danger); }
        .cancel:hover  { background: rgba(194,94,94,0.3); }
        .delete  { background: rgba(90,107,122,0.12); color: var(--color-muted); font-size: 0.85rem; }
        .delete:hover  { background: rgba(194,94,94,0.15); color: var(--color-danger); }

        .btn-action:focus-visible {
          outline: 2px solid var(--color-sabbia);
          outline-offset: 2px;
        }
      `}</style>
        </div>
    );
}
