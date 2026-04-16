// modules/reminders/model.js — In-app notification schema
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication' },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['reminder', 'alert', 'interaction_flag', 'missed_dose', 'report_ready'],
    default: 'reminder',
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ patientId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
