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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
        <h1>Admin Login</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-full">Accedi</button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg);
        }

        .login-box {
          background: var(--color-surface);
          padding: 3rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          width: 100%;
          max-width: 400px;
        }

        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--color-primary);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text-muted);
        }

        input {
          width: 100%;
          padding: 0.8rem;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          border-radius: 4px;
        }

        input:focus {
          border-color: var(--color-primary);
          outline: none;
        }

        .btn-full {
          width: 100%;
          margin-top: 1rem;
        }

        .error {
          color: #ff4444;
          text-align: center;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
