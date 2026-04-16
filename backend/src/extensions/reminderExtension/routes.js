// extensions/reminderExtension/routes.js
const express = require('express');
const router = express.Router();
const responseHandler = require('./responseHandler.service');
const Patient = require('../../modules/patient/model');
const Medication = require('../../modules/medication/model');
const asyncHandler = require('express-async-handler');

/**
 * Endpoint to simulate receiving an SMS response from a patient.
 * POST /api/extensions/reminder/sms-response
 * Body: { phone: string, text: string }
 */
router.post('/sms-response', asyncHandler(async (req, res) => {
  const { phone, text } = req.body;

  if (!phone || !text) {
    return res.status(400).json({ success: false, message: 'Phone and text are required.' });
  }

  // Find the patient by phone
  const patient = await Patient.findOne({ phone });
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found for this phone number.' });
  }

  // Find the most recent active medication for this patient (simplified logic)
  const medication = await Medication.findOne({ patientId: patient._id, status: 'active' });
  if (!medication) {
    return res.status(444).json({ success: false, message: 'No active medication found for tracking.' });
  }

  await responseHandler.handleResponse(patient._id, medication._id, text);

  res.json({ success: true, message: 'Response processed successfully.' });
}));

module.exports = { router, prefix: '/api/extensions/reminder' };
