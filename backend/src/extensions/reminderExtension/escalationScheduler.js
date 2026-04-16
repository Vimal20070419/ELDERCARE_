// extensions/reminderExtension/escalationScheduler.js
const cron = require('node-cron');
const reminderTracker = require('./reminderTracker.service');
const escalationService = require('./escalation.service');
const logger = require('../../utils/logger');

const ESCALATION_DELAY_MINUTES = parseInt(process.env.ESCALATION_DELAY_MINUTES) || 15;

/**
 * Initializes the escalation background job.
 */
const initEscalationJob = () => {
  // Run every 5 minutes to check for overdue reminders
  cron.schedule('*/5 * * * *', async () => {
    logger.debug('[Extension] Running escalation check...');
    try {
      const overdue = await reminderTracker.getPendingOverdue(ESCALATION_DELAY_MINUTES);
      
      if (overdue.length > 0) {
        logger.info(`[Extension] Found ${overdue.length} reminders requiring escalation.`);
        for (const reminder of overdue) {
          await escalationService.triggerEscalation(reminder);
        }
      }
    } catch (err) {
      logger.error(`[Extension] Escalation job error: ${err.message}`);
    }
  });

  logger.info(`[Extension] Escalation scheduler initialised (Delay: ${ESCALATION_DELAY_MINUTES}m).`);
};

module.exports = { initEscalationJob };
