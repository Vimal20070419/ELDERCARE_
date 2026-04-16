// extensions/reminderExtension/responseHandler.service.js
const AdherenceLog = require('../../modules/adherence/model');
const reminderTracker = require('./reminderTracker.service');
const logger = require('../../utils/logger');

class ResponseHandlerService {
  /**
   * Process an incoming patient response.
   * @param {string} patientId
   * @param {string} medicationId
   * @param {string} responseText - "1", "2", "Taken", "Missed", etc.
   */
  async handleResponse(patientId, medicationId, responseText) {
    const text = responseText.toLowerCase().trim();
    let status = null;

    if (text === '1' || text === 'taken') {
      status = 'taken';
    } else if (text === '2' || text === 'missed' || text === 'skipped') {
      status = 'skipped';
    }

    if (!status) {
      logger.warn(`[Extension] Received ambiguous response: "${responseText}" for patient ${patientId}`);
      return;
    }

    try {
      // 1. Update the extension's tracker
      await reminderTracker.updateStatus(patientId, medicationId, status);

      // 2. Log in the core AdherenceLog
      await AdherenceLog.create({
        patientId,
        medicationId,
        scheduledAt: new Date(), // Using current time as proxy for the scheduled time slot
        respondedAt: new Date(),
        status,
        method: 'sms',
        notes: `Automated response via SMS: "${responseText}"`
      });

      logger.info(`[Extension] Successfully processed "${status}" response for patient ${patientId}`);
    } catch (err) {
      logger.error(`[Extension] Error handling response: ${err.message}`);
    }
  }
}

module.exports = new ResponseHandlerService();
