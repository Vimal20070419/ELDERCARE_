// modules/reports/controller.js
const reportService = require('./service');
const { success } = require('../../utils/apiResponse');

exports.getWeeklyReport = async (req, res) => {
  const report = await reportService.generateWeeklyReport(req.params.patientId);
  success(res, report, 'Weekly report generated');
};
