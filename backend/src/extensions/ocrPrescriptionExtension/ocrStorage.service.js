// extensions/ocrPrescriptionExtension/ocrStorage.service.js
const OCRStorage = require('./ocrStorage.model');
const logger = require('../../utils/logger');

class OCRStorageService {
  async saveRecord(patientId, uploadedBy, rawText, parsedStructure, status = 'preview') {
    try {
      const record = await OCRStorage.create({
        patientId,
        uploadedBy,
        rawText,
        parsedStructure,
        status
      });
      logger.info(`Saved OCR pipeline record: ${record._id}`);
      return record;
    } catch (err) {
      logger.error(`OCR Storage failed to save record: ${err.message}`);
      // Don't throw, we don't want telemetry/logging failure to crash the whole injection process
      return null; 
    }
  }

  async markInjected(recordId) {
    if (!recordId) return;
    await OCRStorage.findByIdAndUpdate(recordId, { status: 'injected' });
  }
}

module.exports = new OCRStorageService();
