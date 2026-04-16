// services/scheduler.service.js — node-cron based reminder scheduler
const cron = require('node-cron');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

// Store active cron tasks: medicationId → task[]
const activeTasks = new Map();

class SchedulerService {
  /**
   * Schedule in-app reminder cron jobs for a medication's dose times.
   * Times are in "HH:MM" format (24h).
   */
  scheduleForMedication(medication) {
    if (!medication.times || medication.times.length === 0) return;

    const tasks = [];
    for (const timeStr of medication.times) {
      const [hour, minute] = timeStr.split(':').map(Number);
      if (isNaN(hour) || isNaN(minute)) continue;

      // Cron: minute hour * * *
      const expr = `${minute} ${hour} * * *`;
      const task = cron.schedule(expr, async () => {
        try {
          await notificationService.create(
            medication.patientId,
            medication._id,
            `💊 Reminder: Take ${medication.name} ${medication.dosage} now (${timeStr}).`,
            'reminder',
            'low'
          );
          logger.info(`Reminder fired: ${medication.name} at ${timeStr}`);
        } catch (err) {
          logger.error(`Reminder failed for ${medication.name}: ${err.message}`);
        }
      });

      tasks.push(task);
      logger.info(`Scheduled reminder for "${medication.name}" at ${timeStr} daily.`);
    }

    activeTasks.set(medication._id.toString(), tasks);
  }

  /**
   * Cancel all cron jobs for a given medication.
   */
  cancelForMedication(medicationId) {
    const tasks = activeTasks.get(medicationId.toString());
    if (tasks) {
      tasks.forEach((t) => t.destroy());
      activeTasks.delete(medicationId.toString());
      logger.info(`Cancelled reminders for medication: ${medicationId}`);
    }
  }

  /**
   * Nightly missed-dose marking job — runs at 00:05 every day.
   */
  initNightlyJob(adherenceService) {
    cron.schedule('5 0 * * *', async () => {
      logger.info('Running nightly missed-dose marking job...');
      try {
        const count = await adherenceService.markMissedDoses();
        logger.info(`Nightly job complete — ${count} missed doses marked.`);
      } catch (err) {
        logger.error(`Nightly job error: ${err.message}`);
      }
    });
  }
}

module.exports = new SchedulerService();
