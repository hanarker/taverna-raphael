'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import MenuPdfManager from './components/MenuPdfManager';
import CarouselManager from './components/CarouselManager';
import NewsManager from './components/NewsManager';

const SHIFT_LABELS = {
    lunch:   'Pranzo',
    dinner1: 'Cena 1',
    dinner2: 'Cena 2',
};

const SHIFT_TIMES = {
    lunch:   '13:00 – 15:00',
    dinner1: '19:30 – 21:30',
    dinner2: '21:30 – 23:30',
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('reservations');
    const [reservations, setReservations] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [availability, setAvailability] = useState(null);
    const [editingRes, setEditingRes] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

    const openEdit = (res) => {
        setEditingRes(res);
        setEditForm({ date: res.date, turn: res.turn, guests: res.guests, notes: res.notes || '' });
        setEditError('');
    };

    const closeEdit = () => { setEditingRes(null); setEditForm({}); setEditError(''); };

    const handleEditSave = async () => {
        if (!editForm.date || !editForm.turn || !editForm.guests) {
            setEditError('Compila data, turno e numero ospiti.');
            return;
        }
        setEditSaving(true);
        setEditError('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/reservations/${editingRes.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editForm),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setEditError(data.errors?.[0] ?? data.message ?? 'Errore durante il salvataggio.');
                setEditSaving(false);
                return;
            }
            closeEdit();
            fetchReservations(token, filterDate);
            if (filterDate) fetchAvailability(filterDate);
        } catch {
            setEditError('Impossibile salvare. Controlla la connessione.');
        } finally {
            setEditSaving(false);
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
                <button className={`tab ${activeTab === 'menuPdf' ? 'active' : ''}`} onClick={() => setActiveTab('menuPdf')}>Menu PDF</button>
                <button className={`tab ${activeTab === 'carousel' ? 'active' : ''}`} onClick={() => setActiveTab('carousel')}>Carosello Home</button>
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
                                                <td>{formatDate(res.date)}</td>
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
                                                        <button onClick={() => openEdit(res)} className="btn-action edit" aria-label="Modifica prenotazione">✎</button>
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
                {activeTab === 'menuPdf' && <MenuPdfManager />}
                {activeTab === 'carousel' && <CarouselManager />}
                {activeTab === 'news' && <NewsManager />}
            </div>

            {editingRes && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Modifica prenotazione" onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Modifica Prenotazione</h3>
                            <button className="modal-close" onClick={closeEdit} aria-label="Chiudi">✕</button>
                        </div>
                        <p className="modal-subtitle">{editingRes.firstName} {editingRes.lastName} · {editingRes.email}</p>

                        <div className="modal-field">
                            <label htmlFor="edit-date">Data</label>
                            <input id="edit-date" type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} />
                        </div>

                        <div className="modal-field">
                            <label>Turno</label>
                            <div className="turn-options-edit">
                                {Object.entries(SHIFT_LABELS).map(([key, label]) => (
                                    <label key={key} className={`turn-chip${editForm.turn === key ? ' selected' : ''}`}>
                                        <input type="radio" name="edit-turn" value={key} checked={editForm.turn === key} onChange={() => setEditForm({ ...editForm, turn: key })} />
                                        <span>{label}</span>
                                        <small>{SHIFT_TIMES[key]}</small>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="modal-field">
                            <label htmlFor="edit-guests">Ospiti</label>
                            <input id="edit-guests" type="number" min="1" max="20" value={editForm.guests} onChange={e => setEditForm({ ...editForm, guests: e.target.value })} />
                        </div>

                        <div className="modal-field">
                            <label htmlFor="edit-notes">Note</label>
                            <textarea id="edit-notes" rows="2" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Note speciali…" />
                        </div>

                        {editError && <p className="modal-error" role="alert">{editError}</p>}

                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={closeEdit} disabled={editSaving}>Annulla</button>
                            <button className="btn-modal-save" onClick={handleEditSave} disabled={editSaving}>
                                {editSaving ? 'Salvataggio…' : 'Salva modifiche'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .dashboard-container {
          padding-top: var(--s-16);
          padding-bottom: var(--s-16);
          min-height: 100dvh;
          background: var(--color-ink);
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
          color: var(--color-paper);
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
          color: var(--color-text-soft);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }

        .tab:hover { color: var(--color-paper); }

        .tab.active {
          color: var(--color-paper);
          border-bottom-color: var(--color-brass-bright);
        }

        .tab-content {
          background: var(--color-ink-light);
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
          color: var(--color-paper);
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
          color: var(--color-paper);
          background: var(--color-ink);
          color-scheme: dark;
          cursor: pointer;
        }

        .date-filter:focus {
          outline: 2px solid var(--color-brass-bright);
          outline-offset: 2px;
        }

        .btn-clear-filter {
          background: transparent;
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          padding: 0.4rem 0.75rem;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-text-soft);
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease);
        }

        .btn-clear-filter:hover { color: var(--color-paper); }

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
          background: rgba(173, 138, 69, 0.12);
          border: 1px solid rgba(173, 138, 69, 0.3);
          color: var(--color-brass-bright);
        }

        .capacity-badge.full {
          background: rgba(217, 138, 125, 0.12);
          border-color: rgba(217, 138, 125, 0.35);
          color: var(--color-danger);
        }

        .empty-msg {
          color: var(--color-text-soft);
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
          background: var(--color-ink-light);
        }

        th {
          font-family: var(--font-mono);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: var(--color-brass-bright);
          padding: var(--s-4);
          text-align: left;
          border-bottom: 1px solid var(--color-line);
          background: var(--color-ink);
        }

        td {
          padding: var(--s-4);
          color: var(--color-paper);
          border-bottom: 1px solid var(--color-line);
          font-size: 0.9375rem;
          vertical-align: top;
        }

        td small {
          color: var(--color-text-soft);
          font-size: 0.8125rem;
          display: block;
          margin-top: 0.15rem;
        }

        .notes-text { font-style: italic; }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: var(--color-ink); }

        .turn-badge {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: var(--r-sm);
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(173, 138, 69, 0.14);
          border: 1px solid rgba(173, 138, 69, 0.3);
          color: var(--color-brass-bright);
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

        .confirm { background: rgba(123,174,143,0.15); color: var(--color-success); }
        .confirm:hover { background: rgba(123,174,143,0.3); }
        .cancel  { background: rgba(217,138,125,0.15);  color: var(--color-danger); }
        .cancel:hover  { background: rgba(217,138,125,0.3); }
        .edit    { background: rgba(173,138,69,0.15); color: var(--color-brass-bright); font-size: 0.9rem; }
        .edit:hover    { background: rgba(173,138,69,0.3); }
        .delete  { background: rgba(142,161,166,0.12); color: var(--color-text-soft); font-size: 0.85rem; }
        .delete:hover  { background: rgba(217,138,125,0.15); color: var(--color-danger); }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(13,35,43,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--s-4);
        }

        .modal {
          background: var(--color-ink-light);
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-md);
          padding: var(--s-8);
          width: 100%;
          max-width: 480px;
          box-shadow: 0 8px 32px rgba(13,35,43,0.4);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--s-2);
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--color-paper);
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 1rem;
          color: var(--color-text-soft);
          cursor: pointer;
          padding: var(--s-1);
          line-height: 1;
          transition: color var(--dur-fast) var(--ease);
        }

        .modal-close:hover { color: var(--color-paper); }

        .modal-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-soft);
          margin: 0 0 var(--s-6);
        }

        .modal-field {
          display: flex;
          flex-direction: column;
          gap: var(--s-2);
          margin-bottom: var(--s-5);
        }

        .modal-field label {
          font-family: var(--font-mono);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: var(--color-text-dim);
        }

        .modal-field input[type="date"],
        .modal-field input[type="number"],
        .modal-field textarea {
          border: none;
          border-bottom: 1.5px solid var(--color-line-strong);
          background: transparent;
          padding: var(--s-2) 0;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--color-paper);
          color-scheme: dark;
        }

        .modal-field input:focus,
        .modal-field textarea:focus {
          outline: none;
          border-bottom-color: var(--color-brass-bright);
        }

        .modal-field textarea { resize: vertical; min-height: 56px; }

        .turn-options-edit {
          display: flex;
          gap: var(--s-3);
          flex-wrap: wrap;
        }

        .turn-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--s-3) var(--s-4);
          border: 1.5px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-paper);
          transition: border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
          flex: 1;
          min-width: 100px;
          text-align: center;
        }

        .turn-chip input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .turn-chip small {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--color-text-soft);
        }

        .turn-chip.selected {
          border-color: var(--color-brass-bright);
          background: rgba(201,163,95,0.14);
        }

        .turn-chip:hover:not(.selected) {
          border-color: var(--color-brass-bright);
          background: rgba(201,163,95,0.07);
        }

        .modal-error {
          color: var(--color-danger);
          font-size: 0.875rem;
          margin: 0 0 var(--s-4);
        }

        .modal-actions {
          display: flex;
          gap: var(--s-3);
          justify-content: flex-end;
          margin-top: var(--s-6);
        }

        .btn-modal-cancel {
          background: transparent;
          border: 1px solid var(--color-line-strong);
          border-radius: var(--r-sm);
          padding: 0.5rem 1.25rem;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-text-soft);
          cursor: pointer;
          transition: color var(--dur-fast) var(--ease);
        }

        .btn-modal-cancel:hover { color: var(--color-paper); }
        .btn-modal-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-modal-save {
          background: var(--color-brass);
          color: var(--color-ink);
          border: none;
          border-radius: var(--r-sm);
          padding: 0.5rem 1.25rem;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease);
        }

        .btn-modal-save:hover { background: var(--color-brass-bright); }
        .btn-modal-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-action:focus-visible {
          outline: 2px solid var(--color-brass-bright);
          outline-offset: 2px;
        }
      `}</style>
        </div>
    );
}
