// modules/medication/controller.js
const medicationService = require('./service');
const { success } = require('../../utils/apiResponse');

exports.add = async (req, res) => {
  const med = await medicationService.add(req.body, req.user.id);
  success(res, med, 'Medication added', 201);
};

exports.getPatientMeds = async (req, res) => {
  const meds = await medicationService.  getPatientMedications(req.params.patientId, req.query.status);
  success(res, meds);
};

exports.getById = async (req, res) => {
  const med = await medicationService.getById(req.params.id);
  success(res, med);
};

exports.updateStatus = async (req, res) => {
  const med = await medicationService.updateStatus(req.params.id, req.body.status);
  success(res, med, 'Status updated');
};

exports.getClinicalInfo = async (req, res) => {
  const openFDAService = require('../../services/openfda.service');
  const med = await medicationService.getById(req.params.id);
  const warnings = await openFDAService.getWarnings(med.name);
  const sideEffects = await openFDAService.getSideEffects(med.name);
  success(res, { warnings, sideEffects });
};

exports.deleteMed = async (req, res) => {
  await medicationService.delete(req.params.id);
  success(res, null, 'Medication deleted');
};
