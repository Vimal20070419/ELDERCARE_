// extensions/reminderExtension/index.js
const { injectEnhancer } = require('./reminderEnhancer.middleware');
const { initEscalationJob } = require('./escalationScheduler');
const { router, prefix } = require('./routes');
const smsService = require('../../services/sms.service');
const logger = require('../../utils/logger');

/**
 * Self-bootstrapping extension entry point.
 * This function handles the "injection" logic to ensure the extension works
 * even if not explicitly registered in core files.
 */
const initExtension = (app) => {
  try {
    logger.info('🔌 Initialising Reminder Extension Module...');

    // 1. Inject the SMS enhancer (Monkey Patching)
    injectEnhancer(smsService);

    // 2. Start the escalation background scheduler
    initEscalationJob();

    // 3. Register Extension Routes if app instance is provided
    if (app) {
      app.use(prefix, router);
      logger.info(`[Extension] Routes registered at ${prefix}`);
    }

    logger.info('✅ Reminder Extension fully loaded and active.');
  } catch (err) {
    logger.error(`[Extension] Initialization failed: ${err.message}`);
  }
};

// If this file is required, we can either return the init function or auto-init
// To comply with the "Immutable Architecture", we try to hook into the system.
module.exports = { initExtension, router, prefix };

// AUTO-INIT HOOK: If the system has a common utility that is always loaded (like logger or env),
// we could potentially hook there. For now, we expect the loader to call initExtension.
