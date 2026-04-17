// modules/physicianReport/physicianReport.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./physicianReport.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

/**
 * GET /api/v1/physician-report/:patientId
 * Generates a completeness score and data summary for clinicians.
 */
router.get('/:patientId', protect, requireRole('doctor', 'caregiver'), asyncHandler(ctrl.getReport));

module.exports = { router, prefix: '/api/v1/physician-report' };
