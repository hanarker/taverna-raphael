# CLAUDE.md — Taverna Raphael

Guida per Claude Code su questo progetto. Queste istruzioni hanno precedenza su qualsiasi comportamento predefinito.

---

## Struttura del Progetto

Monorepo con due cartelle distinte:

```
Ristorante/
├── backend/          Node.js + Express 5 + Sequelize (SQLite dev / PostgreSQL prod)
├── frontend/         Next.js 16 (App Router, React 19)
├── start.sh          avvia entrambi i server in dev mode
└── CLAUDE.md
```

---

## Comandi Principali

### Avvio simultaneo (root)
```bash
chmod +x start.sh
./start.sh            # backend :3001 + frontend :3000 in parallelo
```

### Backend (`cd backend`)
```bash
npm run dev           # nodemon hot-reload → http://localhost:3001
npm start             # produzione (applica le migrazioni all'avvio)
npm test              # suite jest
npm run seed          # ⚠️ DISTRUGGE le tabelle e reinizializza DB
```

> **Attenzione porta**: la porta di default è `3001`, non 5000 — la 5000 è occupata da macOS AirPlay Receiver.

### Frontend (`cd frontend`)
```bash
npm run dev           # dev server → http://localhost:3000
npm run build         # build produzione
npm start             # avvia build produzione
```

> Backend: `cd backend && npm test` (jest + supertest, DB SQLite temporaneo). Frontend: nessun test configurato.

---

## Architettura Backend — MVC + Express Router

Pattern: `routes/ → controllers/ → models/` (Sequelize ORM).

| File | Ruolo |
|------|-------|
| `src/server.js` | Entry point: esce se manca `PHONE_HASH_SECRET`, esegue le migrazioni, avvia server e scheduler |
| `src/app.js` | Express, CORS, middleware, mount routes |
| `src/config/db.js` | SQLite se `NODE_ENV=development/test` o `DB_DIALECT=sqlite` (docker-compose usa SQLite), altrimenti PostgreSQL. PRAGMA: busy_timeout, WAL, secure_delete |
| `src/config/migrate.js` + `migrations/` | Runner umzug; `001-booking-system.js` = baseline + import prenotazioni legacy + schema settimanale di default |
| `src/middlewares/auth.middleware.js` | Verifica JWT `Authorization: Bearer <token>` |
| `src/utils/` | `shifts.js` (costanti: 90 min, 40 coperti, max 8, fuso Europe/Rome), `phone.js` (E.164 + HMAC), `time.js` (date nel fuso Roma), `sanitize.js`, `http.js` (errori HTTP, `parseId`) |
| `src/services/` | Logica di dominio (vedi sotto); i controller restano sottili |
| `src/jobs/scheduler.js` | Cron: reminder 24h (ogni 5 min), reminder 09:00, retention 03:30 (Europe/Rome). Disattivabile con `DISABLE_SCHEDULER=1` |
| `scripts/seed.js` | `sync({ force: true })` + admin, news, schema settimanale, 3 prenotazioni demo |
| `tests/` | jest + supertest, DB SQLite temporaneo (`tests/setupEnv.js`, `tests/helpers/db.js`) |

### Sistema prenotazioni (40 coperti)

**Modelli** (`src/models/`, caricati da `models/index.js`): `ShiftTemplate` (turni per giorno della settimana; giorno senza turni = chiuso, es. lunedì), `ShiftOverride` (eccezioni per data; sostituiscono il template, `isClosed` per chiusure), `ShiftSlot` (istanza turno+data con contatore `bookedCovers`), `Reservation` (E.164 in `phone`, `phoneHash`, `status` confirmed/cancelled, `attendance` arrived/late/no_show, consenso con timestamp, reminder già inviati), `NoShowFlag` (solo HMAC del numero), `Setting` (key/JSON), `NotificationLog` (senza dati personali), `StatsDaily` (aggregato anonimo). Più `AdminUser`, `News`, `SiteAsset`.

**Regole**
- Turni da 90 min, max 40 coperti, mai sovrapposti: `schedule.rules.js` (`validateNoOverlap`) + `schedule.service.js`. Il salvataggio viene **rifiutato** (mai corretto in silenzio), anche se toglie turni con prenotazioni attive.
- Atomicità: ogni scrittura passa da `services/atomic.js` (`runAtomic`: coda in-process + `BEGIN IMMEDIATE` su SQLite; su Postgres lock di riga). `booking.service.js` = `createBooking` / `cancelBooking` / `updateBooking`. Il contatore `bookedCovers` si modifica solo lì.
- Online (`source: 'online'`): max 8 coperti, finestra 30 giorni (non modificabile), cutoff configurabile (default 120 min), consenso obbligatorio. Backoffice (`source: 'backoffice'`): niente di questi limiti, ma capienza 40 e doppio numero sempre vietati.
- Doppio numero: unico per `(shiftSlotId, phone)` tra le prenotazioni confermate (controllo + indice unico parziale).
- No-show: marcabile solo a turno iniziato; crea `NoShowFlag`, che si rimuove solo a mano (`PUT /api/admin/noshow-flags`).
- Dati: `phone` sempre E.164; mai loggare numeri/nomi.

**Notifiche** (`services/notifications/`): WhatsApp via Twilio Content API; per ogni evento (`confirmation`, `reminder_24h`, `reminder_morning`, `cancellation`, `bulk_cancellation`, `owner_new_reservation`) `Setting.whatsappTemplates[evento] = { contentSid, variables: [...] }`, modificabile da backoffice (tab Impostazioni). Senza SID → non invia; senza credenziali Twilio → dry-run su log. `dispatch.js` invia in background (in test `flushNotifications()`). **Fallback email = stub TODO** (`email.channel.js`, provider non scelto): un WhatsApp fallito ripiega su un log `skipped_email_todo` e `notificationStatus='failed'` (badge nel backoffice).

**Retention GDPR** (`retention.service.js`): a 30 giorni dalla fine del turno somma in `StatsDaily` (anonimo) e cancella (hard delete) prenotazioni, log e slot, in una transazione. `NoShowFlag` NON viene cancellato (dato pseudonimizzato: va citato nell'informativa).

**Statistiche**: `stats.service.js` unisce prenotazioni vive e `StatsDaily`; funzione pura in `stats.rules.js`.

**Punti aperti / assunzioni**: cutoff 2h da confermare col cliente; calendario ferie e riduzione capienza NON implementati; le prenotazioni manuali non inviano conferma automatica; reminder saltati se la prenotazione è troppo ravvicinata; nessun OTP/captcha sul form pubblico; testo informativa privacy (`/privacy`) è un segnaposto.

### Routes API

| Prefisso | File |
|----------|------|
| `POST /api/auth/login` (rate-limited) | `routes/auth.routes.js` |
| `POST /api/reservations` (pubblica, rate-limited) | `routes/reservations.routes.js` |
| `GET /api/availability?date=`, `GET /api/availability/stream` (SSE) | `routes/availability.routes.js` |
| `/api/admin/*` (JWT): `schedule`, `reservations`, `noshow-flags`, `settings`, `stats` | `routes/admin.routes.js` |
| `POST /api/webhooks/twilio/status` (firma Twilio) | `routes/webhooks.routes.js` |
| `/api/news`, `/api/menu`, `/api/carousel` | `routes/news|menu|carousel.routes.js` |

**Autenticazione**: JWT stateless, scadenza 1 giorno. Token nel `localStorage` del frontend. Le route di scrittura e tutto `/api/admin/*` richiedono `Authorization: Bearer <token>` (401 se assente/non valido).

**CORS**: configurato da `FRONTEND_URL` nel `.env`.

### Proteggere una route
```js
const verifyToken = require('../middlewares/auth.middleware');
router.post('/protected', verifyToken, controller.action);
```

---

## Architettura Frontend — Next.js App Router

```
frontend/app/
├── layout.js                    Root layout (font, metadata, StyledJsxRegistry)
├── registry.js                  StyledJsxRegistry per Styled JSX + SSR
├── globals.css                  Design token CSS + reset globale
├── page.js                      Homepage one-page: assembla le sezioni di components/home/
├── data/
│   └── menu.js                   Piatti del "Pescato del giorno" (dato statico)
├── utils/dates.js               Date nel fuso Europe/Rome (`todayRome`, `addDaysISO`, `formatDateLabel`)
├── components/
│   ├── PublicLayout.jsx          Wrapper pubblico (IntroFade + Navbar + main + Footer)
│   ├── IntroFade.jsx             Overlay di apertura, una volta a sessione
│   ├── Navbar.jsx                Link ad ancore homepage + pagine di servizio
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── CookieBanner.jsx          Banner GDPR cookie consent
│   ├── CarouselHome.jsx          Carosello immagini da /api/carousel (gestito da admin)
│   ├── NewsCard.jsx
│   ├── ReservationForm.jsx       Form pubblico: turni dall'API, telefono con prefisso, consenso, errori per codice
│   ├── ReservationTicket.jsx     Ticket di conferma stampabile/scaricabile
│   ├── reservation/
│   │   ├── ShiftPicker.jsx        Turni della data (disabilita non prenotabili con motivo)
│   │   └── PhoneField.jsx         Prefisso (default +39) + numero; emette `{ dialCode }` / `{ phoneNumber }`
│   └── home/                     Sezioni della homepage one-page
│       ├── AulivellaSection.jsx   #aulivella — card prodotto + CTA e-commerce
│       ├── PescatoSection.jsx     #pescato — legge da data/menu.js
│       ├── DishRow.jsx
│       ├── LocaleSection.jsx      #locale — testo "La casa" + CarouselHome (fusione ex Storia+Locale)
│       ├── PrenotaSection.jsx     #prenota — info + ReservationForm
│       └── DoveSection.jsx        #dove — orari + mappa
├── hooks/
│   ├── useRevealOnScroll.js      IntersectionObserver per animazioni scroll
│   └── useAvailability.js        Disponibilità live: SSE + polling 30s + refetch su visibilitychange
├── services/reservationsApi.js  Client API pubblico (disponibilità, creazione prenotazione)
├── menu/page.jsx                Menu completo in PDF (gestito da admin)
├── news/
│   ├── page.jsx
│   └── [slug]/page.jsx
├── prenotazioni/page.jsx        Redirect a /#prenota (compatibilità link esistenti)
├── cookie-policy/page.jsx
├── privacy/page.jsx             ⚠ segnaposto: testo informativa a cura del cliente
└── admin/
    ├── adminApi.js              `adminFetch(path, {method, body})` → `{ ok, status, data }`; 401 = logout
    ├── login/page.jsx
    └── dashboard/
        ├── page.jsx             Orchestrazione tab: Prenotazioni, Turni, Statistiche, Impostazioni, Menu PDF, Carosello, News
        └── components/
            ├── ReservationsTab.jsx + ReservationRow.jsx   Vista giornaliera, stampa (@media print), presenze
            ├── ReservationFormModal.jsx   Inserimento manuale (anche >8) e modifica
            ├── BulkCancelModal.jsx        Annullo turno/giornata con messaggio libero
            ├── ShiftsManager.jsx + ShiftListEditor.jsx   Schema settimanale + eccezioni per data
            ├── StatsPanel.jsx, SettingsManager.jsx, NoShowLookup.jsx
            ├── AdminModal.jsx, formStyles.js   Modale e CSS condiviso dei form admin (classe `.admin-form`)
            └── MenuPdfManager.jsx, CarouselManager.jsx, NewsManager.jsx
```

**Homepage one-page**: dalla ristrutturazione ispirata a `taverna-raphaelvetrina.html`, `/` è composta dalle sezioni in `app/components/home/` con ancore (`#aulivella`, `#pescato`, `#locale`, `#prenota`, `#dove`). La Navbar punta a queste ancore con `Link href="/#sezione"`; `/prenotazioni` resta come redirect a `/#prenota` per non rompere bookmark e link esterni. Le sezioni "Storia" e "Locale" sono state fuse in un'unica sezione (`LocaleSection.jsx`, id `#locale`): il racconto della casa introduce direttamente il carosello del nuovo spazio, senza foto dedicata.

**Protezione admin**: non esiste un middleware centralizzato — ogni pagina admin legge il JWT dal `localStorage` manualmente. Seguire il pattern di `app/admin/dashboard/page.jsx`.

---

## Design System — Taverna Raphael

Tema notturno con accenti ottone, ispirato a `taverna-raphaelvetrina.html`. Font: **Fraunces** (display, italic) · **Inter** (body) · **IBM Plex Mono** (eyebrow, prezzi, dati tabellari).

### Colori — usa SOLO le variabili CSS, mai valori hardcoded

| Variabile | Valore | Uso |
|-----------|--------|-----|
| `--color-ink` | `#0D232B` | Sfondo pagina |
| `--color-ink-light` | `#15343D` | Sfondo sezioni alternate, pannelli admin |
| `--color-paper` | `#E9E2CD` | Testo primario, sfondo ticket prenotazione |
| `--color-paper-dim` | `#D8CFB2` | Varianti testo su `--color-paper` |
| `--color-brass` | `#AD8A45` | Bordi, fill CTA |
| `--color-brass-bright` | `#C9A35F` | Accenti, eyebrow, hover, focus ring |
| `--color-rust` | `#9A4A3A` | Timbro ticket, dettagli decorativi |
| `--color-text-soft` | `#C7C0A8` | Testo secondario |
| `--color-text-dim` | `#8EA1A6` | Testo terziario, label |
| `--color-line` | `rgba(173,138,69,.18)` | Bordi sottili |
| `--color-line-strong` | `rgba(173,138,69,.25)` | Bordi evidenti |
| `--color-success/warning/danger` | — | Solo admin/feedback UI, desaturati per fondo scuro |

### Tipografia

| Variabile | Font | Uso |
|-----------|------|-----|
| `--font-display` | Fraunces (italic) | H1–H3, ticket prenotazione |
| `--font-body` | Inter | Tutto il resto |
| `--font-mono` | IBM Plex Mono | Eyebrow, prezzi, orari, dati tabellari |

Scale font: `--fs-eyebrow` · `--fs-body` · `--fs-lead` · `--fs-h3` · `--fs-h2` · `--fs-h1`

### Spacing (ritmo 4/8px)

`--s-1` 0.25rem · `--s-2` 0.5rem · `--s-4` 1rem · `--s-6` 1.5rem · `--s-8` 2rem · `--s-12` 3rem · `--s-16` 4rem · `--s-24` 6rem

### Motion

`--dur-fast` 180ms · `--dur-base` 300ms · `--dur-slow` 400ms · `--ease` cubic-bezier(0.2,0.8,0.2,1)

### Classi utility globali

`.eyebrow` · `.divider-line` · `.btn` · `.btn-ghost` · `.container` · `.section`

### Regole stile obbligatorie

- Stili in `<style jsx>{``}</style>` dentro il JSX — mai file CSS separati per i componenti
- `'use client'` solo se il componente usa hook, event handler o API browser
- ⚠ styled-jsx NON elabora CSS passato come variabile: `<style jsx>{VAR}</style>` non applica nulla. Per CSS condiviso (es. `formStyles.js`) usare un `<style>{VAR}</style>` normale; per CSS locale un template literal diretto
- Solo SVG inline — mai librerie di icone esterne
- Mobile-first, breakpoint principali: 640px / 768px / 1024px
- Touch target minimo 44×44px per elementi interattivi
- Focus ring: `:focus-visible { outline: 2px solid var(--color-sabbia); outline-offset: 2px; }`
- Rispettare sempre `@media (prefers-reduced-motion: reduce)`

---

## Variabili d'Ambiente

### `backend/.env`
```
PORT=3001
NODE_ENV=development
DB_NAME=restaurant_db
DB_USER=user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=<genera: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
FRONTEND_URL=http://localhost:3000
PHONE_HASH_SECRET=<obbligatoria: HMAC numeri no-show, non cambiarla dopo il go-live>
TWILIO_ACCOUNT_SID= / TWILIO_AUTH_TOKEN= / TWILIO_WHATSAPP_FROM=whatsapp:+...   # assenti = dry-run
PUBLIC_BASE_URL=<URL pubblico https, per la firma del webhook Twilio>
TRUST_PROXY=<n. proxy fidati; default 2 in produzione, 0 altrimenti>
```

> Docker: `docker-compose.yml` legge le variabili dal `.env` della **root** (JWT_SECRET, PHONE_HASH_SECRET, NGROK_*, TWILIO_*). Senza `PHONE_HASH_SECRET` il backend esce subito. Il DB SQLite vive nel volume `sqlite_data` (`/data/dev.db`); dopo modifiche al codice: `docker compose up -d --build backend|frontend`.

> In `NODE_ENV=development` il DB è SQLite (`backend/dev.db`) — le variabili PostgreSQL sono ignorate.

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Skill Personalizzati

### `/new-component`
Crea un nuovo componente React rispettando il design system Taverna Raphael.
```
/new-component NomeComponente — breve descrizione dello scopo
```

---

## Regole di Sviluppo

### Nuovo componente frontend
1. Crea `frontend/app/components/<Nome>.jsx`
2. Usa solo variabili CSS del design system
3. Styled JSX inline — niente file CSS separati
4. `'use client'` solo se necessario
5. Verifica accessibilità: `aria-label`, `alt`, `focus-visible`

### Nuova route API
1. Crea il modello in `backend/src/models/` (+ export in `models/index.js`) e una **migrazione** in `backend/migrations/`
2. Metti la logica in `backend/src/services/`, il controller in `backend/src/controllers/` resta sottile (usa `sendError`)
3. Crea le routes in `backend/src/routes/`
4. Monta le routes in `backend/src/app.js`
5. Scrivi i test in `backend/tests/` (TDD) e aggiorna `scripts/seed.js` se servono dati demo

### Sicurezza
- Non committare mai `.env` o `dev.db`
- Validare tutti gli input lato backend (nei service, es. `prepareInput` in `booking.service.js`; errori di dominio = `BookingError`)
- Le route di scrittura richiedono sempre `authMiddleware`
- In produzione: generare un `JWT_SECRET` casuale di almeno 32 byte

---

## Note Importanti

- `npm run seed` esegue `sync({ force: true })` — **distrugge e ricrea tutte le tabelle**. Solo in sviluppo.
- Credenziali admin di default (seed): `admin` / `admin123`.
- `seed.js` va eseguito almeno una volta per inizializzare il DB.
- La porta `5000` è occupata da macOS AirPlay Receiver — usare sempre `3001` per il backend.
- Il file `backend/dev.db` (SQLite) non va committato.
- Lo schema si cambia con una **nuova migrazione** in `backend/migrations/` (mai `sync({alter})`). `seed.js` resta solo per sviluppo.
- Le date sono stringhe `YYYY-MM-DD` nel fuso Europe/Rome: usare `utils/time.js` (backend) e `utils/dates.js` (frontend), mai `toISOString()` per "oggi".

<!-- PROMPTOPS:CONTEXT -->

# Project Context (auto-generated by PromptOps)

Use this context to navigate the project efficiently.
Do NOT re-read files listed here unless you need their full content.

A detailed JSON project map is available at `.promptops/project-context.json` — consult it for structured project metadata.

## Project
- **Name**: Ristorante

## Directory Structure
```
backend/
  scripts/
    ... (1 more files)
  src/
    config/
      ... (1 more files)
    controllers/
      ... (4 more files)
    middlewares/
      ... (1 more files)
    models/
      ... (4 more files)
    routes/
      ... (4 more files)
    utils/
      ... (1 more files)
    ... (2 more files)
  package.json
  ... (2 more files)
frontend/
  app/
    admin/
      dashboard/
      login/
    components/
      ... (6 more files)
    cookie-policy/
      ... (1 more files)
    menu/
      ... (1 more files)
    news/
      [slug]/
      ... (1 more files)
    prenotazioni/
      ... (1 more files)
    services/
    ... (6 more files)
  public/
    ... (7 more files)
  next.config.mjs
  package.json
  README.md
  ... (2 more files)
CLAUDE.md
```

<!-- /PROMPTOPS:CONTEXT -->
