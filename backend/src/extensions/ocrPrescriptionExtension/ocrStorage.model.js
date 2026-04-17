// extensions/ocrPrescriptionExtension/ocrStorage.model.js
const mongoose = require('mongoose');

const ocrStorageSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rawText: { type: String, required: true },
  parsedStructure: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['preview', 'injected', 'failed'], default: 'preview' }
}, { timestamps: true });

module.exports = mongoose.model('OCRStorage', ocrStorageSchema);
