# Ristorante — Documentazione

Applicazione web per la gestione di un ristorante. Monorepo con frontend Next.js 15 e backend Express 5 / PostgreSQL.

---

## Setup

### Prerequisiti
- Node.js 18+
- PostgreSQL

### 1. Variabili d'ambiente

**`backend/.env`**
```env
DB_NAME=ristorante
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Installa dipendenze

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Inizializza il database

```bash
cd backend && npm run seed
```

> Crea le tabelle e inserisce admin di default: `admin` / `admin123`
> **Attenzione:** distrugge e ricrea tutte le tabelle (`sync({ force: true })`). Solo in sviluppo.

### 4. Avvia i server

```bash
# Dalla root del progetto (avvia entrambi in parallelo)
chmod +x start.sh && ./start.sh
```

Oppure separatamente:
```bash
cd backend && npm run dev   # porta 5000
cd frontend && npm run dev  # porta 3000
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Autenticazione

| Metodo | Endpoint | Accesso | Descrizione |
|--------|----------|---------|-------------|
| POST | `/auth/login` | Pubblico | Login admin. Body: `{ username, password }`. Ritorna `{ token }` |

Le route protette richiedono header: `Authorization: Bearer <token>` (token valido 1 giorno, salvato in `localStorage`).

---

### Prenotazioni — `/reservations`

| Metodo | Endpoint | Accesso | Descrizione |
|--------|----------|---------|-------------|
| POST | `/reservations` | Pubblico | Crea prenotazione |
| GET | `/reservations` | Admin | Lista tutte (ordinate per data desc) |
| PUT | `/reservations/:id` | Admin | Aggiorna stato |
| DELETE | `/reservations/:id` | Admin | Elimina |

**Body POST:**
```json
{
  "firstName": "Mario",
  "lastName": "Rossi",
  "email": "mario@example.com",
  "phone": "3331234567",
  "date": "2026-04-10",
  "time": "20:00:00",
  "guests": 2,
  "notes": "Tavolo vicino alla finestra"
}
```

**Body PUT (aggiorna stato):**
```json
{ "status": "confirmed" }
```
Valori `status`: `pending` | `confirmed` | `cancelled`

---

### News — `/news`

| Metodo | Endpoint | Accesso | Descrizione |
|--------|----------|---------|-------------|
| GET | `/news` | Pubblico | Lista news (ordinate per `publishedAt` desc) |
| GET | `/news/:slug` | Pubblico | Singola news per slug |
| POST | `/news` | Admin | Crea news |
| PUT | `/news/:id` | Admin | Aggiorna news |
| DELETE | `/news/:id` | Admin | Elimina news |

---

### Menu — `/menu`

| Metodo | Endpoint | Accesso | Descrizione |
|--------|----------|---------|-------------|
| GET | `/menu` | Pubblico | Lista tutti i piatti |
| POST | `/menu` | Admin | Crea piatto |
| PUT | `/menu/:id` | Admin | Aggiorna piatto |
| DELETE | `/menu/:id` | Admin | Elimina piatto |

**Body POST/PUT:**
```json
{
  "name": "Spaghetti al Pomodoro",
  "description": "Pasta fresca con salsa di pomodoro",
  "price": 12.50,
  "category": "Primi",
  "imageUrl": "https://...",
  "allergens": ["gluten"],
  "available": true
}
```

Categorie: `Antipasti`, `Primi`, `Secondi`, `Dolci`, `Vini`

---

## Struttura del progetto

```
Ristorante/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express config e routes
│   │   ├── server.js           # Entry point, sync DB
│   │   ├── config/db.js        # Connessione Sequelize
│   │   ├── models/             # AdminUser, Reservation, News, MenuItem
│   │   ├── controllers/        # Logica business
│   │   ├── routes/             # Router Express
│   │   ├── middlewares/auth.middleware.js  # Verifica JWT
│   │   └── utils/validators.js
│   └── scripts/seed.js         # Init DB con dati di esempio
└── frontend/
    └── app/
        ├── admin/              # Dashboard (protetta) e login
        ├── menu/               # Pagina menu pubblica
        ├── prenotazioni/       # Form prenotazione
        ├── news/               # Lista e dettaglio ([slug])
        ├── components/         # Navbar, Footer, Hero, ReservationForm, NewsCard
        └── services/           # Client API
```

## Stack tecnico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Next.js 15, React 19, Styled JSX |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL, Sequelize ORM |
| Auth | JWT (stateless, 1 giorno) |
| Stile | Dark theme (#0a0a0a), accent oro (#d4af37), font Cinzel + Inter |
