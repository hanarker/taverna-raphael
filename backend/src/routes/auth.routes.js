const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Account admin unico con pieni poteri: limite ai tentativi di accesso per IP.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginLimiter = rateLimit({
    windowMs: LOGIN_WINDOW_MS,
    limit: LOGIN_MAX_ATTEMPTS,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { message: 'Troppi tentativi di accesso: riprova tra qualche minuto.' },
});

router.post('/login', loginLimiter, authController.login);
// router.post('/setup', authController.createInitialAdmin); // Uncomment to create initial admin user

module.exports = router;
