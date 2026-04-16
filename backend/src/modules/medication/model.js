// modules/medication/model.js — Prescription schema
const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  brandName: { type: String, default: '' },
  dosage: { type: String, required: true },       // e.g. "10mg"
  frequency: { type: String, required: true },    // e.g. "twice daily"
  times: [{ type: String }],                      // e.g. ["08:00", "20:00"]
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  instructions: { type: String, default: '' },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);
