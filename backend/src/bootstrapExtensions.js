// bootstrapExtensions.js
/**
 * Senior Architect's Immutable Extension Bootstrapper.
 * This script injects new modules and hooks into the existing application
 * structure without modifying any original source files.
 */
const logger = require('./utils/logger');

module.exports = (app) => {
  logger.info('🚀 Initialising Extended System Components...');

  try {
    // 1. Load New Modules
    const physicianReport = require('./modules/physicianReport/physicianReport.routes');
    const checkin = require('./modules/checkin/checkin.routes');
    const ocrPrescription = require('./extensions/ocrPrescriptionExtension/index');

    const newModules = [physicianReport, checkin, ocrPrescription];

    // 2. Register Routes on the Express instance
    newModules.forEach(mod => {
      app.use(mod.prefix, mod.router);
      logger.info(`[Bootstrap] Registered module at ${mod.prefix}`);
    });

    // 3. Optional: Hook into existing services if needed
    // Example: Intercepting sms.service.sendReminder to append tracking (if not already done)
    
    logger.info('✅ Extension Bootstrap Complete. New features active.');
  } catch (err) {
    logger.error(`[Bootstrap] Error during extension registration: ${err.message}`);
  }
};
