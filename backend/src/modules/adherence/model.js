// modules/adherence/model.js — Adherence log schema
const mongoose = require('mongoose');

const adherenceLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  scheduledAt: { type: Date, required: true },
  respondedAt: { type: Date },
  status: { type: String, enum: ['taken', 'skipped', 'missed'], required: true },
  method: { type: String, enum: ['web', 'sms', 'auto'], default: 'web' },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Index for efficient weekly queries
adherenceLogSchema.index({ patientId: 1, scheduledAt: -1 });
adherenceLogSchema.index({ medicationId: 1, scheduledAt: -1 });

module.exports = mongoose.model('AdherenceLog', adherenceLogSchema);
