// modules/reminders/routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('./controller');
const { protect } = require('../../middleware/auth.middleware');
const asyncHandler = require('express-async-handler');

router.use(protect);
router.get('/unread', asyncHandler(ctrl.getUnread));
router.put('/:id/read', asyncHandler(ctrl.markRead));
router.post('/mark-all-read', asyncHandler(ctrl.markAllRead));

module.exports = { router, prefix: '/api/notifications' };
