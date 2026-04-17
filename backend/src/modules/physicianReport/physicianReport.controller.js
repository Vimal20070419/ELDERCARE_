// modules/physicianReport/physicianReport.controller.js
const physicianReportService = require('./physicianReport.service');
const { success } = require('../../utils/apiResponse');

exports.getReport = async (req, res) => {
  const { patientId } = req.params;
  const report = await physicianReportService.generateReport(patientId);
  success(res, report, 'Physician report generated successfully');
};
