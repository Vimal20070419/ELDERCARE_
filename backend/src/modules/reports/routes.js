// modules/reports/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

router.use(protect);
router.get('/weekly/:patientId', requireRole('caregiver'), asyncHandler(ctrl.getWeeklyReport));

module.exports = { router, prefix: '/api/reports' };
