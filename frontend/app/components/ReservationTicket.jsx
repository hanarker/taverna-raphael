'use client';

import { formatDateLabel } from '../utils/dates';

// Usato solo se le impostazioni non sono ancora state caricate.
const DEFAULT_RESTAURANT_PHONE = '+39 366 357 5967';

/**
 * @param {{ reservation: object, restaurantPhone?: string, onReset: () => void }} props
 */
export default function ReservationTicket({ reservation, restaurantPhone = DEFAULT_RESTAURANT_PHONE, onReset }) {
  const code = buildTicketCode(reservation);
  const dateLabel = formatDateLabel(reservation.date);
  const turnInfo = { label: reservation.shiftName, time: reservation.startTime };
  const guests = Number(reservation.guests);

  const handleDownload = () => {
    const testo = buildReceiptText({ ...reservation, code, dateLabel, turnInfo, guests, restaurantPhone });
    const blob = new Blob([testo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prenotazione-${code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ticket-wrap">
      <div className="ticket">
        <div className="ticket-head">
          <div className="tt">Taverna Raphael</div>
          <div className="ticket-code">{code}</div>
        </div>
        <div className="ticket-grid">
          <div><div className="k">Data</div><div className="v">{dateLabel}</div></div>
          <div><div className="k">Ora</div><div className="v">{turnInfo.time}</div></div>
          <div><div className="k">Persone</div><div className="v">{guests}{guests === 1 ? ' persona' : ' persone'}</div></div>
          <div><div className="k">Nome</div><div className="v">{reservation.firstName} {reservation.lastName}</div></div>
        </div>
        <div className="ticket-hint">Presentati al banco con questo codice, oppure il tuo nome. Ti abbiamo inviato la conferma su WhatsApp.</div>
        <div className="stamp">confermata<br />⚓</div>
      </div>

      <div className="ticket-actions no-print">
        <button type="button" className="ticket-btn" onClick={() => window.print()}>Stampa biglietto</button>
        <button type="button" className="ticket-btn" onClick={handleDownload}>Scarica ricevuta</button>
        <button type="button" className="ticket-btn" onClick={onReset}>Nuova prenotazione</button>
      </div>

      <style jsx>{`
        .ticket-wrap {
          animation: ticket-in 0.6s cubic-bezier(0.2, 0.8, 0.3, 1.1);
        }

        @keyframes ticket-in {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }

        .ticket {
          position: relative;
          background: var(--color-paper);
          color: var(--color-ink);
          padding: var(--s-8) var(--s-8) var(--s-24);
          border-radius: var(--r-sm);
          clip-path: polygon(0 0, 100% 0, 100% 92%, 97% 100%, 93% 92%, 89% 100%, 85% 92%, 81% 100%, 77% 92%, 73% 100%, 69% 92%, 65% 100%, 61% 92%, 57% 100%, 53% 92%, 49% 100%, 45% 92%, 41% 100%, 37% 92%, 33% 100%, 29% 92%, 25% 100%, 21% 92%, 17% 100%, 13% 92%, 9% 100%, 5% 92%, 1% 100%, 0 92%);
        }

        .ticket-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: var(--s-4);
          border-bottom: 1px dashed var(--color-ink);
          padding-bottom: var(--s-4);
          margin-bottom: var(--s-6);
        }

        .tt {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.5rem;
        }

        .ticket-code {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-align: right;
          color: var(--color-rust);
        }

        .ticket-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.8fr 1fr 1.5fr;
          gap: var(--s-6) var(--s-4);
          margin-bottom: var(--s-8);
        }

        .k {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b6250;
          margin-bottom: var(--s-1);
        }

        .v {
          font-family: var(--font-display);
          font-size: 1.05rem;
        }

        .ticket-hint {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          line-height: 1.6;
          color: #6b6250;
          max-width: calc(100% - 128px);
        }

        .stamp {
          position: absolute;
          right: var(--s-8);
          bottom: var(--s-12);
          width: 96px;
          height: 96px;
          border: 3px solid var(--color-rust);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-16deg);
          color: var(--color-rust);
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          text-align: center;
          font-weight: 600;
          animation: stamp-in 0.5s 0.35s backwards;
        }

        @keyframes stamp-in {
          from { opacity: 0; transform: rotate(-16deg) scale(2.2); }
          to   { opacity: 1; transform: rotate(-16deg) scale(1); }
        }

        .ticket-actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--s-3);
          margin-top: var(--s-6);
        }

        .ticket-btn {
          background: none;
          border: 1px solid var(--color-brass);
          color: var(--color-brass-bright);
          padding: 0.7rem 1.1rem;
          border-radius: var(--r-sm);
          font-family: var(--font-body);
          font-size: 0.82rem;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
        }

        .ticket-btn:hover {
          background: var(--color-brass);
          color: var(--color-ink);
        }

        @media print {
          .no-print { display: none !important; }
        }

        @media (max-width: 640px) {
          .ticket { padding: var(--s-6) var(--s-6) 9rem; }
          .ticket-grid { grid-template-columns: repeat(2, 1fr); }
          .ticket-hint { max-width: none; }
          .stamp { right: var(--s-6); bottom: var(--s-8); width: 80px; height: 80px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticket-wrap, .stamp { animation: none; }
        }
      `}</style>
    </div>
  );
}

function buildTicketCode(reservation) {
  const shortDate = String(reservation.date).replace(/-/g, '').slice(2);
  return `TR-${shortDate}-${reservation.id}`;
}

function buildReceiptText({ code, dateLabel, turnInfo, guests, firstName, lastName, restaurantPhone }) {
  return `TAVERNA RAPHAEL — Ricevuta di prenotazione
Codice: ${code}
Data: ${dateLabel}
Turno: ${turnInfo.label} (${turnInfo.time})
Persone: ${guests}
Nome: ${firstName} ${lastName}

Presentati al banco con questo codice o con il tuo nome.
Piazza Sodani 1, Sant'Anastasia (NA) — ${restaurantPhone}`;
}
