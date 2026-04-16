// modules/adherence/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { protect } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

router.use(protect);
router.post('/checkin', asyncHandler(ctrl.checkIn));
router.get('/patient/:patientId/weekly', asyncHandler(ctrl.getWeeklyStats));
router.get('/patient/:patientId/patterns', asyncHandler(ctrl.getMissedPatterns));
router.get('/patient/:patientId/logs', asyncHandler(ctrl.getRecentLogs));

module.exports = { router, prefix: '/api/adherence' };
