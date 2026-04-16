// modules/interactions/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { protect } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

router.use(protect);
router.get('/patient/:patientId', asyncHandler(ctrl.getByPatient));
router.put('/:id/acknowledge', asyncHandler(ctrl.acknowledge));

module.exports = { router, prefix: '/api/interactions' };
