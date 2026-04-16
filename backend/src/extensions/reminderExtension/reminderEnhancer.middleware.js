// extensions/reminderExtension/reminderEnhancer.middleware.js
const reminderTracker = require('./reminderTracker.service');
const logger = require('../../utils/logger');

/**
 * Injects extension logic into the core SMS service.
 */
const injectEnhancer = (smsService) => {
  const originalSendReminder = smsService.sendReminder;

  // Overwrite the sendReminder method
  smsService.sendReminder = async function(to, patientName, medName, dosage, time) {
    logger.info(`[Extension] Intercepting reminder for ${patientName} -> ${medName}`);

    // 1. Calculate the patientId (This is a limitation of the original service signature)
    // In a real scenario, we might need to lookup the patient by phone number 'to'
    const Patient = require('../../modules/patient/model');
    const patient = await Patient.findOne({ phone: to });
    const Medication = require('../../modules/medication/model');
    const medication = await Medication.findOne({ name: medName, patientId: patient?._id });

    // 2. Enhance the message
    const enhancedMsg = `Hello ${patientName}, this is a reminder to take your ${medName} (${dosage}) scheduled for ${time}.\n\nReply:\n1 -> Taken\n2 -> Missed`;

    // 3. Send using the base 'send' method (not originalSendReminder to avoid recursion)
    await this.send(to, enhancedMsg);

    // 4. Register for escalation tracking
    if (patient && medication) {
      await reminderTracker.trackReminder(
        patient._id,
        medication._id,
        medName,
        dosage,
        time
      );
    } else {
      logger.warn(`[Extension] Could not track reminder: Patient or Medication not found for ${to}/${medName}`);
    }
  };

  logger.info('[Extension] smsService.sendReminder successfully enhanced with tracking & response prompts.');
};

module.exports = { injectEnhancer };
