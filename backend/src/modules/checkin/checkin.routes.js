// modules/checkin/checkin.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./checkin.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

/**
 * POST /api/v1/checkin
 * Main entry for manual patient check-ins.
 */
router.post('/', protect, requireRole('patient', 'caregiver'), asyncHandler(ctrl.logCheckin));

/**
 * POST /api/v1/checkin/sms-webhook
 * Diagnostic endpoint to simulate an incoming SMS response.
 */
router.post('/sms-webhook', asyncHandler(ctrl.logSmsCheckin));

module.exports = { router, prefix: '/api/v1/checkin' };
