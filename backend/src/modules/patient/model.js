// modules/patient/model.js — Patient profile schema
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateOfBirth: { type: Date },
  age: { type: Number, min: 0, max: 130 },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  comorbidities: [{ type: String }],
  allergies: [{ type: String }],
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' },
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
