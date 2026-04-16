// services/notification.service.js — In-app notification store + SMS trigger
const Notification = require('../modules/reminders/model');
const Patient = require('../modules/patient/model');
const User = require('../modules/auth/model');
const smsService = require('./sms.service');
const logger = require('../utils/logger');

class NotificationService {
  async create(patientId, medicationId, message, type = 'reminder', severity = 'low') {
    try {
      // 1. Create in-app notification record
      const notif = await Notification.create({ patientId, medicationId, message, type, severity });
      logger.info(`Notification [${type}|${severity}]: ${message}`);

      // 2. Trigger SMS asynchronously
      this._triggerSMS(patientId, message, type, severity).catch(err => 
        logger.error(`SMS trigger failure: ${err.message}`)
      );

      return notif;
    } catch (err) {
      logger.error(`Failed to create notification: ${err.message}`);
    }
  }

  async _triggerSMS(patientId, message, type, severity) {
    try {
      // Find patient with populated info
      const patient = await Patient.findOne({ _id: patientId }).populate('userId');
      if (!patient) return logger.warn(`SMS skipped: Patient ${patientId} not found.`);

      if (type === 'reminder') {
        // Send to Patient
        if (patient.phone && patient.userId?.smsEnabled !== false) {
          await smsService.send(patient.phone, message);
        } else {
          logger.debug(`SMS skipped: Patient preference or missing phone.`);
        }
      } else if (severity === 'high' || severity === 'critical' || type === 'interaction_flag' || type === 'missed_dose') {
        // Send to Caregiver
        const caregiver = await User.findById(patient.caregiverId);
        if (caregiver && caregiver.phone && caregiver.smsEnabled !== false) {
          const alertMsg = `ElderCare Alert [${patient.userId?.name}]: ${message}`;
          await smsService.send(caregiver.phone, alertMsg);
        } else {
          logger.debug(`SMS alert skipped: Caregiver preference or missing phone.`);
        }
      }
    } catch (err) {
      logger.error(`Error in _triggerSMS: ${err.message}`);
    }
  }

  async getUnread(userId) {
    return await Notification.find({ patientId: userId, read: false })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markRead(notificationId) {
    return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }

  async markAllRead(patientId) {
    return await Notification.updateMany({ patientId, read: false }, { read: true });
  }
}

module.exports = new NotificationService();
