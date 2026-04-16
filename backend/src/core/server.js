// core/server.js — HTTP server entry point
const createApp = require('./app');
const connectDB = require('../config/db');
const { PORT } = require('../config/env');
const schedulerService = require('../services/scheduler.service');
const adherenceService = require('../modules/adherence/service');
const logger = require('../utils/logger');

const start = async () => {
  await connectDB();

  const app = createApp();

  // Start nightly missed-dose marking job
  schedulerService.initNightlyJob(adherenceService);
  logger.info('Nightly missed-dose cron job initialised.');

  app.listen(PORT, () => {
    logger.info(`🚀 ElderCare API running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
