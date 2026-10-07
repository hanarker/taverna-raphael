'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ReservationsTab from './components/ReservationsTab';
import ShiftsManager from './components/ShiftsManager';
import StatsPanel from './components/StatsPanel';
import SettingsManager from './components/SettingsManager';
import MenuPdfManager from './components/MenuPdfManager';
import CarouselManager from './components/CarouselManager';
import NewsManager from './components/NewsManager';

const TABS = [
    { id: 'reservations', label: 'Prenotazioni', Component: ReservationsTab },
    { id: 'shifts', label: 'Turni', Component: ShiftsManager },
    { id: 'stats', label: 'Statistiche', Component: StatsPanel },
    { id: 'settings', label: 'Impostazioni', Component: SettingsManager },
    { id: 'menuPdf', label: 'Menu PDF', Component: MenuPdfManager },
    { id: 'carousel', label: 'Carosello Home', Component: CarouselManager },
    { id: 'news', label: 'Gestione News', Component: NewsManager },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('reservations');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Protezione admin: nessun middleware centralizzato, ogni pagina legge il JWT dal localStorage.
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            router.push('/admin/login');
            return;
        }
        setIsAuthenticated(true);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/admin/login');
    };

    if (!isAuthenticated) return null;
    const ActiveComponent = TABS.find((tab) => tab.id === activeTab).Component;

    return (
        <div className="dashboard-container container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>

            <div className="tabs" role="tablist">
                {TABS.map((tab) => (
                    <button key={tab.id} role="tab" aria-selected={activeTab === tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tab-content" role="tabpanel">
                <ActiveComponent />
            </div>

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
          min-height: 44px;
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
          overflow-x: auto;
        }

        .tab {
          padding: var(--s-4) var(--s-6);
          min-height: 44px;
          background: transparent;
          color: var(--color-text-soft);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          white-space: nowrap;
          transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
        }

        .tab:hover { color: var(--color-paper); }
        .tab:focus-visible { outline: 2px solid var(--color-brass-bright); outline-offset: -2px; }

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

        @media (max-width: 640px) {
          .tab-content { padding: var(--s-4); }
        }

        @media (prefers-reduced-motion: reduce) {
          .tab, .btn-logout { transition: none; }
        }
      `}</style>
        </div>
    );
}
