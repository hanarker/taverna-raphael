const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Dietro ngrok/Next il rate limit deve vedere l'IP reale del cliente: numero di proxy fidati configurabile.
const trustedProxies = Number(process.env.TRUST_PROXY ?? (process.env.NODE_ENV === 'production' ? 2 : 0));
if (trustedProxies > 0) app.set('trust proxy', trustedProxies);

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'development'
    ? true
    : (process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
        : 'http://localhost:3000');

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const authRoutes = require('./routes/auth.routes');
const reservationRoutes = require('./routes/reservations.routes');
const newsRoutes = require('./routes/news.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/availability', require('./routes/availability.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/webhooks', require('./routes/webhooks.routes'));
app.use('/api/news', newsRoutes);
app.use('/api/menu', require('./routes/menu.routes'));
app.use('/api/carousel', require('./routes/carousel.routes'));

app.get('/', (req, res) => {
    res.send('Restaurant API is running');
});

module.exports = app;
