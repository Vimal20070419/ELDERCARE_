const express = require('express');
const router = express.Router();
const ctrl = require('./ocr.controller');
const multer = require('multer');
const { protect, requireRole } = require('../../middleware/auth.middleware');

// Use memory storage to process image buffer directly
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // limit to 5MB
});

/**
 * POST /api/v1/ocr/scan
 * Uploads an image and extracts medication info via Gemini
 */
router.post('/scan', protect, requireRole('caregiver', 'doctor'), upload.single('image'), ctrl.scanPrescripton);

module.exports = { router, prefix: '/api/v1/ocr' };
