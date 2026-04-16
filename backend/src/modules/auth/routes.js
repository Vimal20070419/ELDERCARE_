// modules/auth/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { protect } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { body } = require('express-validator');

const regValidations = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['doctor', 'caregiver', 'patient']).withMessage('Invalid role'),
  body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
];

router.post('/register', authLimiter, regValidations, validate, asyncHandler(ctrl.register));
router.post('/login', authLimiter, [body('email').isEmail().normalizeEmail()], validate, asyncHandler(ctrl.login));
router.post('/otp/request', authLimiter, [body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone format')], validate, asyncHandler(ctrl.requestOTP));
router.post('/otp/verify', authLimiter, [body('phone').notEmpty(), body('otp').isLength({ min: 6 })], validate, asyncHandler(ctrl.verifyOTP));
router.get('/me', protect, asyncHandler(ctrl.getMe));
router.post('/refresh', protect, asyncHandler(ctrl.refreshToken));
router.put('/prefs', protect, asyncHandler(ctrl.updatePrefs));

module.exports = { router, prefix: '/api/auth' };
