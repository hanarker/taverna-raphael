const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');

router.get('/', availabilityController.getAvailability);
router.get('/stream', availabilityController.streamAvailability);

module.exports = router;
