// services/sms.service.js — Pluggable SMS service (simulated for now)
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { SMS_ENABLED, SMS_PROVIDER } = require('../config/env');

const LOG_FILE = path.join(__dirname, '../../sms_outbox.log');

class SMSService {
  /**
   * Send an SMS message.
   * @param {string} to - Recipient phone number.
   * @param {string} message - Message body.
   */
  async send(to, message) {
    if (!SMS_ENABLED) {
      logger.debug(`SMS disabled. Would have sent "${message}" to ${to}`);
      return;
    }

    if (!to) {
      logger.warn(`SMS failed: No recipient phone number provided for message: "${message}"`);
      return;
    }

    try {
      if (SMS_PROVIDER === 'simulated') {
        const logEntry = `[${new Date().toISOString()}] TO: ${to} | MSG: ${message}\n`;
        fs.appendFileSync(LOG_FILE, logEntry);
        
        logger.info(`[SMS SIMULATED] To: ${to} | Msg: ${message}`);
        console.log('\x1b[45m%s\x1b[0m', ` SMS SENT TO ${to}: ${message} `); // Purple background log
      } else {
        // Placeholder for real provider (e.g. Twilio)
        // const client = require('twilio')(ACCOUT_SID, AUTH_TOKEN);
        // await client.messages.create({ body: message, to, from: SENDER });
        logger.warn(`SMS Provider "${SMS_PROVIDER}" not implemented. Simulated send instead.`);
      }
    } catch (err) {
      logger.error(`SMS send error: ${err.message}`);
    }
  }

  /**
   * Send a medication reminder SMS.
   */
  async sendReminder(to, patientName, medName, dosage, time) {
    const msg = `Hello ${patientName}, this is a reminder to take your ${medName} (${dosage}) scheduled for ${time}. Reply TAKEN if you've done so!`;
    await this.send(to, msg);
  }

  /**
   * Send a critical alert SMS to the caregiver.
   */
  async sendCriticalAlert(to, patientName, alertType, detail) {
    const msg = `CRITICAL ALERT for ${patientName}: ${alertType}. Detail: ${detail}. Please check the dashboard immediately.`;
    await this.send(to, msg);
  }
}

module.exports = new SMSService();
