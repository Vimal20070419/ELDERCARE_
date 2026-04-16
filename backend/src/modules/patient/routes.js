// modules/patient/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

router.use(protect);
router.post('/', requireRole('caregiver', 'doctor'), asyncHandler(ctrl.create));
router.get('/', requireRole('caregiver'), asyncHandler(ctrl.getMyPatients));
router.get('/all', requireRole('doctor'), asyncHandler(ctrl.listAll));
router.get('/profile', requireRole('patient'), asyncHandler(ctrl.getMyProfile));
router.get('/:id', requireRole('caregiver', 'doctor'), asyncHandler(ctrl.getById));
router.get('/:id/ai-insights', requireRole('caregiver', 'doctor'), asyncHandler(ctrl.getAIInsights));
router.put('/:id', requireRole('caregiver'), asyncHandler(ctrl.update));

module.exports = { router, prefix: '/api/patients' };
