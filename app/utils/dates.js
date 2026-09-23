const TIMEZONE = 'Europe/Rome';
const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

// Data odierna "YYYY-MM-DD" nel fuso del ristorante (non UTC: dopo le 22 non deve slittare al giorno dopo).
export function todayRome() {
  return dateFormatter.format(new Date());
}

export function addDaysISO(isoDate, days) {
  const base = new Date(`${isoDate}T12:00:00Z`);
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function formatDateLabel(isoDate) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  });
}
