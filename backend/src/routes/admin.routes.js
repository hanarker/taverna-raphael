const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const scheduleController = require('../controllers/schedule.admin.controller');
const admin = require('../controllers/reservations.admin.controller');

// Tutte le route admin richiedono il JWT del maître (account unico, pieni poteri).
router.use(verifyToken);

router.get('/schedule', scheduleController.getSchedule);
router.put('/schedule/weekly/:weekday', scheduleController.putWeekly);
router.put('/schedule/override/:date', scheduleController.putOverride);
router.delete('/schedule/override/:date', scheduleController.deleteOverride);

router.get('/reservations', admin.list);
router.post('/reservations', admin.create);
router.post('/reservations/bulk-cancel', admin.bulkCancel);
router.put('/reservations/:id', admin.update);
router.post('/reservations/:id/cancel', admin.cancel);
router.patch('/reservations/:id/attendance', admin.setAttendance);

router.get('/noshow-flags', admin.getFlag);
router.put('/noshow-flags', admin.putFlag);

router.get('/settings', admin.getSettings);
router.put('/settings', admin.putSettings);
router.get('/stats', admin.stats);

module.exports = router;
