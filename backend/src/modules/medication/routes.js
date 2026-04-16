// modules/medication/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

router.use(protect);
router.post('/', requireRole('caregiver', 'doctor'), asyncHandler(ctrl.add));
router.get('/patient/:patientId', asyncHandler(ctrl.getPatientMeds));
router.get('/:id/clinical', asyncHandler(ctrl.getClinicalInfo));
router.get('/:id', asyncHandler(ctrl.getById));
router.put('/:id/status', requireRole('caregiver', 'doctor'), asyncHandler(ctrl.updateStatus));
router.delete('/:id', requireRole('caregiver', 'doctor'), asyncHandler(ctrl.deleteMed));

module.exports = { router, prefix: '/api/medications' };
