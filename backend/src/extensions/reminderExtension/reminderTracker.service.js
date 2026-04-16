// extensions/reminderExtension/reminderTracker.service.js
const { ReminderTracking } = require('./models');
const logger = require('../../utils/logger');

class ReminderTrackerService {
  /**
   * Initialize tracking for a newly sent reminder.
   */
  async trackReminder(patientId, medicationId, medicationName, dosage, scheduledTime) {
    try {
      const tracking = await ReminderTracking.create({
        patientId,
        medicationId,
        medicationName,
        dosage,
        scheduledTime,
        status: 'pending'
      });
      logger.info(`[Extension] Started tracking reminder for ${medicationName} (ID: ${tracking._id})`);
      return tracking;
    } catch (err) {
      logger.error(`[Extension] Failed to track reminder: ${err.message}`);
    }
  }

  /**
   * Update the status of a tracked reminder.
   */
  async updateStatus(patientId, medicationId, status) {
    try {
      // Find the most recent pending reminder for this patient/medication
      const reminder = await ReminderTracking.findOne({
        patientId,
        medicationId,
        status: 'pending'
      }).sort({ sentAt: -1 });

      if (reminder) {
        reminder.status = status;
        await reminder.save();
        logger.info(`[Extension] Updated reminder status to ${status} for ${reminder.medicationName}`);
      }
    } catch (err) {
      logger.error(`[Extension] Failed to update reminder status: ${err.message}`);
    }
  }

  /**
   * Find pending reminders that have exceeded the escalation timeout.
   */
  async getPendingOverdue(timeoutMinutes) {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return await ReminderTracking.find({
      status: 'pending',
      sentAt: { $lt: cutoff }
    });
  }
}

module.exports = new ReminderTrackerService();
