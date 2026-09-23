'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Login fallito');
      }
    } catch (err) {
      setError('Errore di connessione');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-brand">
          <span className="brand-display">Taverna Raphael</span>
        </div>
        <h1>Area Riservata</h1>
        {error && <p className="error" role="alert">{error}</p>}
        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-full">Accedi</button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-ink);
          padding: var(--s-6);
        }

        .login-box {
          background: var(--color-ink-light);
          padding: var(--s-12);
          border-radius: var(--r-md);
          border: 1px solid var(--color-line-strong);
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 24px rgba(13, 35, 43, 0.4);
        }

        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: var(--s-6);
        }

        .brand-display {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--color-brass-bright);
        }

        h1 {
          text-align: center;
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--color-text-soft);
          margin-bottom: var(--s-8);
          letter-spacing: 0.02em;
        }

        .form-group {
          margin-bottom: var(--s-6);
          display: flex;
          flex-direction: column;
          gap: var(--s-2);
        }

        label {
          font-family: var(--font-mono);
          font-size: var(--fs-eyebrow);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: var(--color-text-dim);
        }

        input {
          width: 100%;
          padding: var(--s-3) 0;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid var(--color-line-strong);
          color: var(--color-paper);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: border-color var(--dur-fast) var(--ease);
          border-radius: 0;
          color-scheme: dark;
        }

        input:focus {
          border-bottom: 2px solid var(--color-brass-bright);
          outline: none;
        }

        .btn-full {
          width: 100%;
          margin-top: var(--s-4);
          text-align: center;
          display: block;
          padding: 1rem;
        }

        .error {
          color: var(--color-danger);
          text-align: center;
          margin-bottom: var(--s-4);
          font-size: 0.9rem;
          padding: var(--s-3);
          background: rgba(194, 94, 94, 0.08);
          border-radius: var(--r-sm);
          border-left: 3px solid var(--color-danger);
        }
      `}</style>
    </div>
  );
}
