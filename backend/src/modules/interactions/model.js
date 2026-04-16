// modules/interactions/model.js — Drug interaction flag schema
const mongoose = require('mongoose');

const interactionFlagSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  drug1: { type: String, required: true },
  drug2: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  description: { type: String, default: '' },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('InteractionFlag', interactionFlagSchema);
