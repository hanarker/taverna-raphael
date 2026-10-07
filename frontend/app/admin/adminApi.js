const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const NETWORK_ERROR = 'Impossibile contattare il server. Controlla la connessione.';

// Chiamata autenticata alle API admin. Ritorna sempre { ok, status, data }:
// data.error contiene il messaggio (già in italiano) da mostrare al titolare.
export async function adminFetch(path, { method = 'GET', body } = {}) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  if (!token) {
    window.location.href = '/admin/login';
    return { ok: false, status: 401, data: { error: 'Sessione scaduta.' } };
  }
  try {
    const res = await fetch(`${API_URL}/api/admin${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
    if (res.status === 401) {
      window.localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: NETWORK_ERROR } };
  }
}

export const publicAvailabilityUrl = (date) => `${API_URL}/api/availability?date=${encodeURIComponent(date)}`;
