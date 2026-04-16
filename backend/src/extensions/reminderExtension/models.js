// extensions/reminderExtension/models.js
const mongoose = require('mongoose');

// Metadata storage for patients specifically for the escalation system
const patientExtensionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, unique: true },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    relation: { type: String }
  },
  lastEscalatedAt: { type: Date },
}, { timestamps: true });

// State tracking for outgoing reminders
const reminderTrackingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  medicationName: { type: String, required: true },
  dosage: { type: String },
  scheduledTime: { type: String },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'taken', 'skipped', 'escalated'], default: 'pending' },
  escalatedAt: { type: Date }
}, { timestamps: true });

const PatientExtension = mongoose.model('PatientExtension', patientExtensionSchema);
const ReminderTracking = mongoose.model('ReminderTracking', reminderTrackingSchema);

module.exports = { PatientExtension, ReminderTracking };
