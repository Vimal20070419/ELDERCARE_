// extensions/reminderExtension/escalation.service.js
const { PatientExtension } = require('./models');
const Patient = require('../../modules/patient/model');
const smsService = require('../../services/sms.service');
const logger = require('../../utils/logger');

class EscalationService {
  /**
   * Triggers an escalation alert for a specific reminder.
   */
  async triggerEscalation(reminder) {
    try {
      // 1. Find emergency contact from the extension mapping
      let ext = await PatientExtension.findOne({ patientId: reminder.patientId });
      
      // Fallback: If no extension data exists, check the core Patient model
      let emergencyContact = ext?.emergencyContact;
      if (!emergencyContact) {
        const patient = await Patient.findById(reminder.patientId);
        if (patient?.emergencyContact?.phone) {
          emergencyContact = patient.emergencyContact;
        }
      }

      if (!emergencyContact || !emergencyContact.phone) {
        logger.warn(`[Extension] Escalation failed: No emergency contact found for patient ${reminder.patientId}`);
        return;
      }

      // 2. Send the Alert SMS
      const alertMsg = `Alert: Patient missed medication "${reminder.medicationName}" (${reminder.dosage || ''}) scheduled for ${reminder.scheduledTime}. Please check on them.`;
      
      await smsService.send(emergencyContact.phone, alertMsg);
      
      // 3. Update reminder status to 'escalated'
      reminder.status = 'escalated';
      reminder.escalatedAt = new Date();
      await reminder.save();

      logger.info(`[Extension] Escalation triggered and sent to ${emergencyContact.phone} for patient ${reminder.patientId}`);
    } catch (err) {
      logger.error(`[Extension] Escalation trigger error: ${err.message}`);
    }
  }
}

module.exports = new EscalationService();
