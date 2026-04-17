// extensions/ocrPrescriptionExtension/routes.js
const express = require('express');
const router = express.Router();
const uploadMiddleware = require('./upload.middleware');
const ctrl = require('./ocr.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');

// Protect route wrapper + role checker boundary
router.post('/upload', protect, requireRole('caregiver', 'doctor'), uploadMiddleware, ctrl.uploadAndProcess);

module.exports = router;
