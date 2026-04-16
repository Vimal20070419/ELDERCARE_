// modules/patient/controller.js
const patientService = require('./service');
const aiService = require('../../services/ai.service');
const { success } = require('../../utils/apiResponse');

exports.create = async (req, res) => {
  const patient = await patientService.create(req.body, req.user.id);
  success(res, patient, 'Patient created', 201);
};

exports.getMyPatients = async (req, res) => {
  const patients = await patientService.getByCaregiverId(req.user.id);
  success(res, patients);
};

exports.getById = async (req, res) => {
  const patient = await patientService.getById(req.params.id);
  success(res, patient);
};

exports.getMyProfile = async (req, res) => {
  const patient = await patientService.getByUserId(req.user.id);
  success(res, patient);
};

exports.update = async (req, res) => {
  const patient = await patientService.update(req.params.id, req.body);
  success(res, patient, 'Patient updated');
};

exports.listAll = async (req, res) => {
  const result = await patientService.getAllPatients();
  success(res, result, 'All patients retrieved successfully');
};

exports.getAIInsights = async (req, res) => {
  const patient = await patientService.getById(req.params.id);
  const insights = await aiService.getPatientInsights(req.params.id, patient);
  success(res, insights);
};
