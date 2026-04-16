// modules/reminders/controller.js
const notificationService = require('../../services/notification.service');
const { success } = require('../../utils/apiResponse');

exports.getUnread = async (req, res) => {
  // Both caregivers (via patientId) and patients (by userId mapped to patientId) can fetch
  const patientId = req.query.patientId || req.user.patientId;
  const notifs = await notificationService.getUnread(patientId);
  success(res, notifs);
};

exports.markRead = async (req, res) => {
  const notif = await notificationService.markRead(req.params.id);
  success(res, notif, 'Marked as read');
};

exports.markAllRead = async (req, res) => {
  const patientId = req.body.patientId;
  await notificationService.markAllRead(patientId);
  success(res, null, 'All notifications marked as read');
};
