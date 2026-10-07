const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const reservationsController = require('../controllers/reservations.controller');

// Limite anti-abuso sul solo POST pubblico (i test lo disattivano con DISABLE_RATE_LIMIT).
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const createLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { code: 'RATE_LIMITED', error: 'Troppe richieste: riprova tra qualche minuto.' },
});

router.post('/', createLimiter, reservationsController.createReservation);

module.exports = router;
