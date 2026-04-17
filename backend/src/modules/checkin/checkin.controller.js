// modules/checkin/checkin.controller.js
const checkinService = require('./checkin.service');
const { success } = require('../../utils/apiResponse');

exports.logCheckin = async (req, res) => {
  const { medicationId, status } = req.body;
  const patientId = req.user.patientId || req.body.patientId;

  if (!medicationId || !status) {
    return res.status(400).json({ success: false, message: 'medicationId and status are required' });
  }

  const log = await checkinService.logCheckin(patientId, medicationId, status);
  success(res, log, 'Check-in successful');
};

exports.logSmsCheckin = async (req, res) => {
  const { phone, text } = req.body;
  if (!phone || !text) {
    return res.status(400).json({ success: false, message: 'phone and text are required' });
  }

  const log = await checkinService.logSmsCheckin(phone, text);
  success(res, log, 'SMS Check-in processed');
};
