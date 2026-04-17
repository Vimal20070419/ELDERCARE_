// modules/checkin/checkin.service.js
const AdherenceLog = require('../adherence/model');
const Medication = require('../medication/model');
const logger = require('../../utils/logger');

class CheckinService {
  /**
   * Logs a medication check-in.
   * @param {string} patientId
   * @param {string} medicationId
   * @param {string} status - 'taken' | 'skipped'
   */
  async logCheckin(patientId, medicationId, status) {
    try {
      // 1. Verify medication exists and belongs to patient
      const medication = await Medication.findOne({ _id: medicationId, patientId });
      if (!medication) throw new Error('Medication not found for this patient');

      // 2. Create the adherence log entry
      const log = await AdherenceLog.create({
        patientId,
        medicationId,
        status,
        scheduledAt: new Date(), // Manual check-in uses current time
        respondedAt: new Date(),
        method: 'web',
        notes: `Manual check-in via simple interface`
      });

      logger.info(`Check-in logged for patient ${patientId}: ${medication.name} -> ${status}`);
      return log;
    } catch (err) {
      logger.error(`Check-in logging failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Process a check-in via phone number (SMS simulation).
   * @param {string} phone
   * @param {string} text - "TAKEN" | "SKIPPED"
   */
  async logSmsCheckin(phone, text) {
    const Patient = require('../patient/model');
    const patient = await Patient.findOne({ phone });
    if (!patient) throw new Error('Patient not found for this phone number');

    const status = text.toLowerCase().trim() === 'taken' ? 'taken' : 'skipped';
    
    // Find latest active medication for this patient to attribute the check-in
    const medication = await Medication.findOne({ patientId: patient._id, status: 'active' }).sort({ updatedAt: -1 });
    if (!medication) throw new Error('No active medication found for SMS check-in');

    return await this.logCheckin(patient._id, medication._id, status);
  }
}

module.exports = new CheckinService();
