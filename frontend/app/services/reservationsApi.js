const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const availabilityUrl = (date) => `${API_URL}/api/availability?date=${encodeURIComponent(date)}`;
export const availabilityStreamUrl = () => `${API_URL}/api/availability/stream`;

export async function fetchAvailability(date, signal) {
  const res = await fetch(availabilityUrl(date), { cache: 'no-store', signal });
  if (!res.ok) throw new Error(`availability ${res.status}`);
  return res.json();
}

// Ritorna { ok, data } — in caso di errore data contiene { code, error, available? } dal backend.
export async function createReservation(payload) {
  const res = await fetch(`${API_URL}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
