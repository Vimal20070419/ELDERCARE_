// modules/adherence/controller.js
const adherenceService = require('./service');
const { success } = require('../../utils/apiResponse');

exports.checkIn = async (req, res) => {
  const { patientId, medicationId, status, notes } = req.body;
  const log = await adherenceService.logCheckIn(patientId, medicationId, status, notes);
  success(res, log, 'Check-in recorded', 201);
};

exports.getWeeklyStats = async (req, res) => {
  const stats = await adherenceService.getWeeklyStats(req.params.patientId);
  success(res, stats);
};

exports.getMissedPatterns = async (req, res) => {
  const patterns = await adherenceService.detectMissedPatterns(req.params.patientId);
  success(res, patterns);
};

exports.getRecentLogs = async (req, res) => {
  const logs = await adherenceService.getRecentLogs(req.params.patientId, parseInt(req.query.limit) || 50);
  success(res, logs);
};
